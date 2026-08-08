import {
    MicIcon,
    MicOffIcon,
    CameraIcon,
    CameraOffIcon,
    LeaveCallIcon,
    ScreenShareIcon,
    ScreenShareOffIcon,
} from "./icons";

export default function ControlBar({
    isMicOn,
    onToggleMic,
    isCameraOn,
    onToggleCamera,
    isScreenSharing,
    onToggleScreenShare,
    onLeaveCall,
}) {
    const btnBase = {
        width: "42px",
        height: "42px",
        borderRadius: "10px",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    return (
        <div
            style={{
                position: "absolute",
                bottom: "24px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "10px",
                background: "#131315",
                border: "1px solid #232326",
                borderRadius: "14px",
                padding: "8px",
            }}>
            <button
                className="control-btn"
                onClick={onToggleMic}
                style={{
                    ...btnBase,
                    background: isMicOn ? "transparent" : "#e5484d",
                    color: isMicOn ? "#d4d4d8" : "#fff",
                }}
                title={isMicOn ? "Mute mic" : "Unmute mic"}>
                {isMicOn ? <MicIcon /> : <MicOffIcon />}
            </button>

            <button
                className="control-btn"
                onClick={onToggleCamera}
                style={{
                    ...btnBase,
                    background: isCameraOn ? "transparent" : "#e5484d",
                    color: isCameraOn ? "#d4d4d8" : "#fff",
                }}
                title={isCameraOn ? "Turn off camera" : "Turn on camera"}>
                {isCameraOn ? <CameraIcon /> : <CameraOffIcon />}
            </button>

            <button
                className="control-btn"
                onClick={onToggleScreenShare}
                style={{
                    ...btnBase,
                    background: isScreenSharing ? "rgba(52, 211, 153, 0.15)" : "transparent",
                    color: isScreenSharing ? "#34d399" : "#d4d4d8",
                    border: isScreenSharing ? "1px solid rgba(52, 211, 153, 0.3)" : "none",
                }}
                title={isScreenSharing ? "Stop sharing" : "Share screen"}>
                {isScreenSharing ? <ScreenShareOffIcon /> : <ScreenShareIcon />}
            </button>

            {/* Separator */}
            <div
                style={{
                    width: "1px",
                    background: "#2a2a2e",
                    margin: "4px 2px",
                }}
            />

            <button
                className="control-btn"
                onClick={onLeaveCall}
                style={{
                    ...btnBase,
                    width: "56px",
                    background: "#e5484d",
                    color: "#fff",
                    borderRadius: "10px",
                }}
                title="Leave call">
                <LeaveCallIcon />
            </button>
        </div>
    );
}

