import { useState } from "react";
import socket from "../socket";
import TextBubble from "./TextBubble";
import { SendIcon } from "./icons";

// ---- comfy palette tokens (matches Room.jsx / Home.jsx) ----
const palette = {
    violet: "#B1B2FF",
    blue: "#AAC4FF",
    lilac: "#D2DAFF",
    mist: "#EEF1FF",
    ink: "#3E3D63",
    inkSoft: "#6B6A93",
    coral: "#F79088",
    card: "#FFFFFF",
};
const fontDisplay = "'Fredoka', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const fontBody = "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const shadowSoft = "0 10px 26px rgba(120, 120, 200, 0.18)";

export default function ChatPanel({ chat, onSendMessage }) {
    const [message, setMessage] = useState("");

    const handleSend = () => {
        onSendMessage(message);
        setMessage("");
    };

    return (
        <div
            className="chat-panel"
            style={{
                width: "300px",
                borderLeft: `none`,
                background: palette.card,
                borderRadius: "28px 0 0 28px",
                boxShadow: "-8px 0 24px rgba(120, 120, 200, 0.15)",
                display: "flex",
                flexDirection: "column",
                padding: "22px 20px",
                minHeight: 0,
                overflow: "hidden",
                fontFamily: fontBody,
                position: "relative",
                zIndex: 2,
            }}>
            <h3
                style={{
                    color: palette.ink,
                    fontFamily: fontDisplay,
                    fontWeight: 600,
                    fontSize: "16px",
                    margin: "0 0 14px",
                    flexShrink: 0,
                    letterSpacing: "0.2px",
                }}>
                Messages
            </h3>
            <div
                style={{
                    height: "2px",
                    background: palette.lilac,
                    borderRadius: "2px",
                    marginBottom: "16px",
                    flexShrink: 0,
                }}
            />

            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column-reverse",
                    gap: "8px",
                    marginBottom: "14px",
                }}>
                {[...chat].reverse().map((data, index) => (
                    <div className="message-wrapper" key={index}>
                        <TextBubble data={data} id={socket.id} index={index} />
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Say something nice…"
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    style={{
                        flex: 1,
                        minWidth: 0,
                        padding: "10px 15px",
                        borderRadius: "16px",
                        border: `2px solid ${palette.lilac}`,
                        background: palette.mist,
                        color: palette.ink,
                        fontFamily: fontBody,
                        fontWeight: 600,
                        fontSize: "13px",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color .15s ease",
                    }}
                />
                <button
                    onClick={handleSend}
                    style={{
                        width: "40px",
                        height: "40px",
                        flexShrink: 0,
                        borderRadius: "14px",
                        border: "none",
                        background: palette.violet,
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: shadowSoft,
                        transition: "transform .15s ease",
                    }}>
                    <SendIcon />
                </button>
            </div>
        </div>
    );
}
