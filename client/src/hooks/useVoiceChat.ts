import { useCallback, useEffect, useRef, useState } from "react";

// Free public STUN servers for NAT traversal. No TURN server is configured,
// so on some restrictive/symmetric-NAT mobile networks the direct P2P
// connection may fail to establish — this covers the vast majority of
// home/mobile networks without needing a paid TURN service.
const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

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
  const localStreamRef = useRef<MediaStream | null>(null);
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("[VoiceChat] Got local mic stream (caller path), tracks:", stream.getAudioTracks().length);
      localStreamRef.current = stream;
      stream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));

      const pc = createPeerConnection();
      pcRef.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

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
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log("[VoiceChat] Got local mic stream (callee path), tracks:", stream.getAudioTracks().length);
          localStreamRef.current = stream;
          stream.getAudioTracks().forEach((t) => (t.enabled = !isMuted));
          const pc = createPeerConnection();
          pcRef.current = pc;
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
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
