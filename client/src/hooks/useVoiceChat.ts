import { useCallback, useEffect, useRef, useState } from "react";

// Free public STUN servers for NAT traversal. No TURN server is configured,
// so on some restrictive/symmetric-NAT mobile networks the direct P2P
// connection may fail to establish — this covers the vast majority of
// home/mobile networks without needing a paid TURN service.
const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

// On phones, the microphone and speaker sit very close together, so the
// mic easily picks up the phone's own speaker output and re-sends it,
// creating a whirring/feedback noise on the other end. Laptops usually
// avoid this via built-in acoustic hardware/software handling, but on
// mobile browsers these constraints must be requested explicitly.
const MIC_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

// Wraps a raw mic MediaStream with a lightweight, DIY voice-activity noise
// gate built on the Web Audio API: it measures the mic's live volume and
// only lets audio through when it's above a small threshold, muting
// everything else (background hiss, a quiet feedback whine, room noise).
// This runs IN ADDITION to the browser's own built-in echo cancellation —
// it doesn't replace it, but catches low-level noise the browser's own
// processing didn't fully remove, which is often exactly what a faint
// "motor/bearing whirring" feedback tone sounds like.
function applyNoiseGate(stream: MediaStream): MediaStream {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioCtx();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    const gainNode = audioCtx.createGain();
    const destination = audioCtx.createMediaStreamDestination();

    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(destination);

    const data = new Uint8Array(analyser.frequencyBinCount);
    const OPEN_THRESHOLD = 12; // volume level (0-255ish) needed to open the gate
    const CLOSE_THRESHOLD = 7; // slightly lower, so it doesn't chatter on/off
    let gateOpen = false;

    const tick = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length;

      if (!gateOpen && avg > OPEN_THRESHOLD) {
        gateOpen = true;
        gainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 0.02);
      } else if (gateOpen && avg < CLOSE_THRESHOLD) {
        gateOpen = false;
        gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.08);
      }
      requestAnimationFrame(tick);
    };
    gainNode.gain.value = 0; // start closed/muted until someone actually speaks
    tick();

    return destination.stream;
  } catch (e) {
    console.warn("[VoiceChat] Noise gate setup failed, using raw mic stream:", e);
    return stream;
  }
}

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

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

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
      if (pc.connectionState === "connected") setCallStatus("connected");
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
      const gatedStream = applyNoiseGate(stream);
      localStreamRef.current = gatedStream;
      gatedStream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));

      const pc = createPeerConnection();
      pcRef.current = pc;
      gatedStream.getTracks().forEach((track) => pc.addTrack(track, gatedStream));

      // Deterministic caller/callee split: lower playerId makes the offer.
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
          const gatedStream = applyNoiseGate(stream);
          localStreamRef.current = gatedStream;
          gatedStream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
          const pc = createPeerConnection();
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
