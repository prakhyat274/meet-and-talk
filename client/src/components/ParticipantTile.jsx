import { useRef, useEffect, useState } from "react";
import { MicOffIcon } from "./icons";

const palette = {
    violet: "#B1B2FF",
    blue: "#AAC4FF",
    lilac: "#D2DAFF",
    ink: "#3E3D63",
    coral: "#F79088",
};
const fontDisplay = "'Fredoka', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const fontBody = "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const shadowSoft = "0 10px 26px rgba(120, 120, 200, 0.18)";

export default function ParticipantTile({ username, stream, isLocal, isMicOn, isCameraOn }) {
    const videoRef = useRef(null);
    const [hasVideo, setHasVideo] = useState(false);

    const showVideo = hasVideo && isCameraOn !== false;

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

        stream.addEventListener("addtrack", checkVideo);
        stream.addEventListener("removetrack", checkVideo);

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
                background: `linear-gradient(160deg, ${palette.lilac}, ${palette.blue})`,
                borderRadius: "24px",
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: isLocal ? `3px solid ${palette.violet}` : "none",
                boxShadow: shadowSoft,
                overflow: "hidden",
            }}>

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: showVideo ? "block" : "none",
                    transform: isLocal ? "scaleX(-1)" : "none",
                }}
            />

            {!showVideo && (
                <div
                    style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: palette.violet,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: fontDisplay,
                        fontSize: "20px",
                        fontWeight: 600,
                        color: "#fff",
                        flexShrink: 0,
                        boxShadow: shadowSoft,
                    }}>
                    {initials}
                </div>
            )}

            <div
                style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(62,61,99,0.55)",
                    padding: "5px 10px",
                    borderRadius: "100px",
                    fontFamily: fontBody,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "calc(100% - 20px)",
                }}>
                {isMicOn === false && (
                    <span style={{ display: "flex", color: palette.coral }}>
                        <MicOffIcon />
                    </span>
                )}
                {username}
                {isLocal && " (You)"}
            </div>
        </div>
    );
}