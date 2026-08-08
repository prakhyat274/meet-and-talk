import { ChatIcon } from "./icons";

const palette = {
    violet: "#B1B2FF",
    lilac: "#D2DAFF",
    ink: "#3E3D63",
    inkSoft: "#6B6A93",
    card: "#FFFFFF",
    mintDeep: "#7FD9AE",
};
const fontDisplay = "'Fredoka', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const fontBody = "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const shadowSoft = "0 10px 26px rgba(120, 120, 200, 0.18)";

export default function RoomHeader({ roomCode, participantCount, isChatOpen, onToggleChat }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                flexShrink: 0,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: palette.card,
                        color: palette.inkSoft,
                        fontFamily: fontBody,
                        fontWeight: 700,
                        fontSize: "12.5px",
                        padding: "8px 14px",
                        borderRadius: "100px",
                        boxShadow: shadowSoft,
                    }}>
                    <span
                        style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: palette.mintDeep,
                        }}
                    />
                    {participantCount} in call
                </span>
            </div>
            <button
                onClick={onToggleChat}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "9px 16px",
                    borderRadius: "14px",
                    border: "none",
                    background: isChatOpen ? palette.ink : palette.violet,
                    color: "#fff",
                    fontFamily: fontBody,
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: shadowSoft,
                    transition: "transform .15s ease, background .2s ease",
                }}>
                <ChatIcon />
                Chat
            </button>
        </div>
    );
}
