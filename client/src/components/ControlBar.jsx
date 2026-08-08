import {
    MicIcon,
    MicOffIcon,
    CameraIcon,
    CameraOffIcon,
    LeaveCallIcon,
    ScreenShareIcon,
    ScreenShareOffIcon,
} from "./icons";

// ---- comfy palette tokens (matches Room.jsx / Home.jsx) ----
const palette = {
    violet: "#B1B2FF",
    blue: "#AAC4FF",
    lilac: "#D2DAFF",
    mist: "#EEF1FF",
    ink: "#3E3D63",
    inkSoft: "#6B6A93",
    coral: "#F79088",
    coralDeep: "#F0645A",
    card: "#FFFFFF",
};
const shadowPop = "0 14px 32px rgba(120, 120, 200, 0.26)";

export default function ControlBar({
    isMicOn,
    onToggleMic,
    isCameraOn,
    onToggleCamera,
    onLeaveCall,
}) {
    const btnBase = {
        width: "48px",
        height: "48px",
        borderRadius: "16px",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform .15s ease, box-shadow .15s ease, background .2s ease",
    };

    return (
        <div
            style={{
                position: "absolute",
                bottom: "24px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: palette.card,
                border: "none",
                borderRadius: "24px",
                padding: "10px",
                boxShadow: shadowPop,
                zIndex: 3,
            }}>
            <button
                className="control-btn"
                onClick={onToggleMic}
                style={{
                    ...btnBase,
                    background: isMicOn ? palette.mist : palette.coral,
                    color: isMicOn ? palette.ink : "#fff",
                }}
                title={isMicOn ? "Mute mic" : "Unmute mic"}>
                {isMicOn ? <MicIcon /> : <MicOffIcon />}
            </button>

            <button
                className="control-btn"
                onClick={onToggleCamera}
                style={{
                    ...btnBase,
                    background: isCameraOn ? palette.mist : palette.coral,
                    color: isCameraOn ? palette.ink : "#fff",
                }}
                title={isCameraOn ? "Turn off camera" : "Turn on camera"}>
                {isCameraOn ? <CameraIcon /> : <CameraOffIcon />}
            </button>



            {/* Separator */}
            <div
                style={{
                    width: "2px",
                    height: "30px",
                    background: palette.lilac,
                    borderRadius: "2px",
                    margin: "0 2px",
                }}
            />

            <button
                className="control-btn"
                onClick={onLeaveCall}
                style={{
                    ...btnBase,
                    width: "62px",
                    background: palette.coralDeep,
                    color: "#fff",
                    borderRadius: "16px",
                }}
                title="Leave call">
                <LeaveCallIcon />
            </button>
        </div>
    );
}
