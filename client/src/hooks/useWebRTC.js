import { useEffect, useRef, useState, useCallback } from "react";
import socket from "../socket";

const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ],
};

export default function useWebRTC(roomCode) {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState(new Map());
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [mediaError, setMediaError] = useState(null);

    const peerConnections = useRef(new Map());
    const localStreamRef = useRef(null);
    const pendingCandidates = useRef(new Map());

    // ── Acquire local media ──────────────────────────────────────

    useEffect(() => {
        let cancelled = false;

        async function initMedia() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                });
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                localStreamRef.current = stream;
                setLocalStream(stream);
            } catch (err) {
                console.error("Failed to access media devices:", err);
                setMediaError(err.message || "Could not access camera/microphone");
                // Try audio-only fallback
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: false,
                    });
                    if (cancelled) {
                        audioStream.getTracks().forEach((t) => t.stop());
                        return;
                    }
                    localStreamRef.current = audioStream;
                    setLocalStream(audioStream);
                    setIsCameraOn(false);
                } catch (audioErr) {
                    console.error("Failed to access audio:", audioErr);
                }
            }
        }

        initMedia();

        return () => {
            cancelled = true;
        };
    }, []);

    // ── Create a peer connection for a remote socket ─────────────

    const createPeerConnection = useCallback(
        (remoteSocketId) => {
            if (peerConnections.current.has(remoteSocketId)) {
                return peerConnections.current.get(remoteSocketId);
            }

            const pc = new RTCPeerConnection(ICE_SERVERS);

            // Add local tracks
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => {
                    pc.addTrack(track, localStreamRef.current);
                });
            }

            // Handle incoming remote tracks
            pc.ontrack = (event) => {
                const [remoteStream] = event.streams;
                if (remoteStream) {
                    setRemoteStreams((prev) => {
                        const next = new Map(prev);
                        next.set(remoteSocketId, remoteStream);
                        return next;
                    });
                }
            };

            // Send ICE candidates to the remote peer
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("ice-candidate", {
                        targetSocketId: remoteSocketId,
                        candidate: event.candidate,
                    });
                }
            };

            pc.oniceconnectionstatechange = () => {
                if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
                    console.warn(`ICE connection ${pc.iceConnectionState} for peer ${remoteSocketId}`);
                }
            };

            peerConnections.current.set(remoteSocketId, pc);
            return pc;
        },
        [],
    );

    // ── Flush buffered ICE candidates ────────────────────────────

    const flushCandidates = useCallback((remoteSocketId, pc) => {
        const buffered = pendingCandidates.current.get(remoteSocketId);
        if (buffered && buffered.length > 0) {
            buffered.forEach((c) => pc.addIceCandidate(new RTCIceCandidate(c)));
            pendingCandidates.current.delete(remoteSocketId);
        }
    }, []);

    // ── Signaling event handlers ─────────────────────────────────

    useEffect(() => {
        if (!localStreamRef.current) return;

        // When a new user joins, existing peers create an offer
        const handleUserJoined = async ({ socketId: remoteSocketId }) => {
            const pc = createPeerConnection(remoteSocketId);
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit("webrtc-offer", {
                    targetSocketId: remoteSocketId,
                    offer: pc.localDescription,
                });
            } catch (err) {
                console.error("Error creating offer:", err);
            }
        };

        // Receive an offer from an existing peer → create answer
        const handleOffer = async ({ senderSocketId, offer }) => {
            const pc = createPeerConnection(senderSocketId);
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                flushCandidates(senderSocketId, pc);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("webrtc-answer", {
                    targetSocketId: senderSocketId,
                    answer: pc.localDescription,
                });
            } catch (err) {
                console.error("Error handling offer:", err);
            }
        };

        // Receive an answer from a peer we sent an offer to
        const handleAnswer = async ({ senderSocketId, answer }) => {
            const pc = peerConnections.current.get(senderSocketId);
            if (!pc) return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                flushCandidates(senderSocketId, pc);
            } catch (err) {
                console.error("Error handling answer:", err);
            }
        };

        // Receive ICE candidate from a peer
        const handleIceCandidate = async ({ senderSocketId, candidate }) => {
            const pc = peerConnections.current.get(senderSocketId);
            if (pc && pc.remoteDescription) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Error adding ICE candidate:", err);
                }
            } else {
                // Buffer candidates until remote description is set
                if (!pendingCandidates.current.has(senderSocketId)) {
                    pendingCandidates.current.set(senderSocketId, []);
                }
                pendingCandidates.current.get(senderSocketId).push(candidate);
            }
        };

        // When a user leaves, tear down their peer connection
        const handleUserLeft = ({ socketId: remoteSocketId }) => {
            const pc = peerConnections.current.get(remoteSocketId);
            if (pc) {
                pc.close();
                peerConnections.current.delete(remoteSocketId);
            }
            pendingCandidates.current.delete(remoteSocketId);
            setRemoteStreams((prev) => {
                const next = new Map(prev);
                next.delete(remoteSocketId);
                return next;
            });
        };

        socket.on("user-joined", handleUserJoined);
        socket.on("webrtc-offer", handleOffer);
        socket.on("webrtc-answer", handleAnswer);
        socket.on("ice-candidate", handleIceCandidate);
        socket.on("user-left", handleUserLeft);

        return () => {
            socket.off("user-joined", handleUserJoined);
            socket.off("webrtc-offer", handleOffer);
            socket.off("webrtc-answer", handleAnswer);
            socket.off("ice-candidate", handleIceCandidate);
            socket.off("user-left", handleUserLeft);
        };
    }, [localStream, createPeerConnection, flushCandidates]);

    // ── Cleanup on unmount ───────────────────────────────────────

    useEffect(() => {
        return () => {
            peerConnections.current.forEach((pc) => pc.close());
            peerConnections.current.clear();
            pendingCandidates.current.clear();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((t) => t.stop());
                localStreamRef.current = null;
            }
        };
    }, []);

    // ── Toggle mic / camera ──────────────────────────────────────

    const toggleMic = useCallback(() => {
        if (!localStreamRef.current) return;
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMicOn(audioTrack.enabled);
            socket.emit("toggle-mic", { isMicOn: audioTrack.enabled });
        }
    }, []);

    const toggleCamera = useCallback(() => {
        if (!localStreamRef.current) return;
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsCameraOn(videoTrack.enabled);
            socket.emit("toggle-camera", { isCameraOn: videoTrack.enabled });
        }
    }, []);

    return {
        localStream,
        remoteStreams,
        isMicOn,
        isCameraOn,
        mediaError,
        toggleMic,
        toggleCamera,
    };
}
