import { useCallback, useEffect, useRef, useState } from "react";

// Free public STUN servers for NAT traversal, always included. On top of
// these, we fetch short-lived TURN relay credentials from our own server
// (backed by Twilio) at call-start time — STUN alone is enough on most
// WiFi networks, but some mobile-data connections sit behind carrier-grade
// NAT where a direct peer-to-peer connection can't form at all, and a TURN
// relay is the only way through.
const FREE_STUN_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

async function getIceServers(): Promise<RTCIceServer[]> {
  try {
    const res = await fetch("/api/turn-credentials");
    const data = await res.json();
    if (Array.isArray(data.iceServers) && data.iceServers.length > 0) {
      console.log("[VoiceChat] Using TURN relay servers as fallback");
      return [...FREE_STUN_SERVERS, ...data.iceServers];
    }
  } catch (e) {
    console.warn("[VoiceChat] Could not fetch TURN credentials, using STUN only:", e);
  }
  return FREE_STUN_SERVERS;
}

// On phones, the microphone and speaker sit very close together, so the
// mic easily picks up the phone's own speaker output and re-sends it,
// creating a whirring/feedback noise on the other end. Laptops usually
// avoid this via built-in acoustic hardware/software handling, but on
// mobile browsers these constraints must be requested explicitly.
// (We confirmed the earlier "motor/bearing whirring" report was actually
// same-room acoustic feedback during testing, not a software bug — these
// constraints are back on since they genuinely help in real usage.)
const MIC_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

interface UseVoiceChatOptions {
  // Becomes true once the opponent is connected and the match is starting.
  // The call is established automatically as soon as this flips true.
  enabled: boolean;
  // My own playerId and the opponent's playerId. Whoever's id sorts first
  // alphabetically is the one who creates the WebRTC offer — this avoids
  // needing any extra "who goes first" signaling between the two clients.
  playerId: string;
  opponentId: string | null;
  // Sends a JSON-serializable signaling message over the existing game
  // WebSocket connection (the same one already used for guesses/chat).
  sendSignal: (message: any) => void;
}

export function useVoiceChat({ enabled, playerId, opponentId, sendSignal }: UseVoiceChatOptions) {
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "connected" | "failed">("idle");

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null); // the gated stream actually sent over WebRTC
  const rawStreamRef = useRef<MediaStream | null>(null); // the raw mic stream, kept only to fully release the microphone on cleanup
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const cleanup = useCallback(() => {
    startedRef.current = false;
    setCallStatus("idle");
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (rawStreamRef.current) {
      rawStreamRef.current.getTracks().forEach((t) => t.stop());
      rawStreamRef.current = null;
    }
    pendingCandidatesRef.current = [];
  }, []);

  const createPeerConnection = useCallback(async () => {
    const iceServers = await getIceServers();
    const pc = new RTCPeerConnection({ iceServers });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({ type: "voice_ice_candidate", data: { candidate: event.candidate.toJSON() } });
      }
    };

    pc.ontrack = (event) => {
      console.log("[VoiceChat] ontrack fired, remote stream:", event.streams[0]);
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play()
          .then(() => console.log("[VoiceChat] Remote audio playing"))
          .catch((e) => console.warn("[VoiceChat] Remote audio play blocked:", e));
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("[VoiceChat] Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setCallStatus("connected");
        // Log audio network quality every 4s — a "motor/robotic" warbling
        // sound during a call is very often caused by packet loss or high
        // jitter (the network dropping bits of audio), not the mic/speaker
        // setup at all. This confirms or rules that out.
        const statsInterval = setInterval(async () => {
          if (pc.connectionState !== "connected") {
            clearInterval(statsInterval);
            return;
          }
          const stats = await pc.getStats();
          stats.forEach((report) => {
            if (report.type === "inbound-rtp" && report.kind === "audio") {
              console.log(
                "[VoiceChat] Audio network quality — packetsLost:", report.packetsLost,
                "jitter:", report.jitter,
                "concealedSamples (guessed-in gaps):", report.concealedSamples,
                "totalSamplesReceived:", report.totalSamplesReceived
              );
            }
          });
        }, 4000);
      }
      else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        setCallStatus("failed");
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("[VoiceChat] ICE connection state:", pc.iceConnectionState);
    };

    pc.onicegatheringstatechange = () => {
      console.log("[VoiceChat] ICE gathering state:", pc.iceGatheringState);
    };

    return pc;
  }, [sendSignal]);

  const startCall = useCallback(async () => {
    if (startedRef.current || !opponentId) return;
    startedRef.current = true;
    setCallStatus("connecting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: MIC_CONSTRAINTS });
      console.log("[VoiceChat] Got local mic stream (caller path), tracks:", stream.getAudioTracks().length);
      console.log("[VoiceChat] Actual applied audio settings:", stream.getAudioTracks()[0]?.getSettings());
      rawStreamRef.current = stream;
      localStreamRef.current = stream;
      stream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));

      const pc = await createPeerConnection();
      pcRef.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      const iAmCaller = playerId < opponentId;
      console.log("[VoiceChat] iAmCaller:", iAmCaller, "my id:", playerId, "opponent id:", opponentId);
      if (iAmCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log("[VoiceChat] Sending offer");
        sendSignal({ type: "voice_offer", data: { sdp: offer } });
      }
    } catch (err) {
      console.warn("Voice chat mic access failed:", err);
      setCallStatus("failed");
    }
  }, [opponentId, playerId, isMuted, createPeerConnection, sendSignal]);

  const handleSignalMessage = useCallback(async (message: any) => {
    if (message.fromPlayerId === playerId) return; // ignore our own relayed messages

    if (message.type === "voice_offer") {
      console.log("[VoiceChat] Received offer from", message.fromPlayerId);
      if (!pcRef.current) {
        // Callee path: we haven't started yet, set up now in response to the offer.
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: MIC_CONSTRAINTS });
          console.log("[VoiceChat] Got local mic stream (callee path), tracks:", stream.getAudioTracks().length);
          console.log("[VoiceChat] Actual applied audio settings:", stream.getAudioTracks()[0]?.getSettings());
          rawStreamRef.current = stream;
          const gatedStream = stream;
          localStreamRef.current = gatedStream;
          gatedStream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
          const pc = await createPeerConnection();
          pcRef.current = pc;
          gatedStream.getTracks().forEach((track) => pc.addTrack(track, gatedStream));
          startedRef.current = true;
          setCallStatus("connecting");
        } catch (err) {
          console.warn("Voice chat mic access failed (callee):", err);
          setCallStatus("failed");
          return;
        }
      }
      const pc = pcRef.current!;
      await pc.setRemoteDescription(new RTCSessionDescription(message.data.sdp));
      for (const cand of pendingCandidatesRef.current) {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      }
      pendingCandidatesRef.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log("[VoiceChat] Sending answer");
      sendSignal({ type: "voice_answer", data: { sdp: answer } });
    } else if (message.type === "voice_answer") {
      console.log("[VoiceChat] Received answer from", message.fromPlayerId);
      const pc = pcRef.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(message.data.sdp));
        for (const cand of pendingCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        }
        pendingCandidatesRef.current = [];
      }
    } else if (message.type === "voice_ice_candidate") {
      const pc = pcRef.current;
      const candidate = message.data.candidate;
      if (pc && pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((e) =>
          console.warn("addIceCandidate error:", e)
        );
      } else {
        // Remote description not set yet — queue it for after setRemoteDescription.
        pendingCandidatesRef.current.push(candidate);
      }
    }
  }, [playerId, isMuted, createPeerConnection, sendSignal]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = !next));
      }
      return next;
    });
  }, []);

  // Auto-start the call once the opponent is known and connected.
  useEffect(() => {
    if (enabled && opponentId && !startedRef.current) {
      startCall();
    }
  }, [enabled, opponentId, startCall]);

  // Clean up the call entirely on unmount (leaving the match).
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return { isMuted, toggleMute, callStatus, handleSignalMessage, remoteAudioRef };
}
