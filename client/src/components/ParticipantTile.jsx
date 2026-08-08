import { useRef, useEffect, useState } from "react";
import { MicOffIcon } from "./icons";

export default function ParticipantTile({ username, stream, isLocal, isMicOn }) {
    const videoRef = useRef(null);
    const [hasVideo, setHasVideo] = useState(false);

    const initials = username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    useEffect(() => {
        if (!videoRef.current || !stream) {
            setHasVideo(false);
            return;
        }

        videoRef.current.srcObject = stream;

        const checkVideo = () => {
            const videoTracks = stream.getVideoTracks();
            setHasVideo(videoTracks.length > 0 && videoTracks[0].enabled && !videoTracks[0].muted);
        };

        checkVideo();

        // Listen for track changes
        stream.addEventListener("addtrack", checkVideo);
        stream.addEventListener("removetrack", checkVideo);

        // Poll track enabled state (tracks can be enabled/disabled without events)
        const interval = setInterval(checkVideo, 500);

        return () => {
            stream.removeEventListener("addtrack", checkVideo);
            stream.removeEventListener("removetrack", checkVideo);
            clearInterval(interval);
        };
    }, [stream]);

    return (
        <div
            className="participant-tile"
            style={{
                position: "relative",
                background: "#131315",
                borderRadius: "10px",
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #1f1f22",
                overflow: "hidden",
            }}>
            {/* Video element — always rendered but hidden when no video */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: hasVideo ? "block" : "none",
                    transform: isLocal ? "scaleX(-1)" : "none",
                }}
            />

            {/* Initials fallback when camera is off */}
            {!hasVideo && (
                <div
                    style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "#232326",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: 500,
                        color: "#c9c9cd",
                        flexShrink: 0,
                    }}>
                    {initials}
                </div>
            )}

            {/* Username label */}
            <div
                style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(10,10,11,0.7)",
                    padding: "3px 9px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#e4e4e7",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "calc(100% - 20px)",
                }}>
                {isMicOn === false && (
                    <span style={{ display: "flex", color: "#e5484d" }}>
                        <MicOffIcon />
                    </span>
                )}
                {username}
                {isLocal && " (You)"}
            </div>
        </div>
    );
}

