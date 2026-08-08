import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../App.css";

// ---- comfy palette tokens (matches Room.jsx) ----
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
const shadowPop = "0 14px 32px rgba(120, 120, 200, 0.26)";

// small floating background blobs, purely decorative
function ComfyBackdrop() {
    const blobs = [
        { size: 300, top: -90, left: -70, bg: palette.lilac, opacity: 0.55 },
        { size: 220, bottom: -70, right: "5%", bg: palette.blue, opacity: 0.5 },
        { size: 160, top: "35%", right: -70, bg: palette.violet, opacity: 0.22 },
        { size: 130, bottom: "8%", left: "6%", bg: palette.coral, opacity: 0.16 },
    ];
    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            {blobs.map((b, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        width: b.size,
                        height: b.size,
                        borderRadius: "50%",
                        background: b.bg,
                        opacity: b.opacity,
                        filter: "blur(2px)",
                        top: b.top,
                        left: b.left,
                        right: b.right,
                        bottom: b.bottom,
                    }}
                />
            ))}
        </div>
    );
}

function Home() {
    const [roomCode, setRoomCode] = useState("");
    const [username, setUsername] = useState(localStorage.getItem("username") ?? "");
    const [isUsernameEmpty, setIsUsernameEmpty] = useState(false);
    const [roomCodeError, setRoomCodeError] = useState("");
    const navigate = useNavigate();

    const handleStartMeet = async () => {
        if (username.trim() === "") {
            setIsUsernameEmpty(true);
            return;
        }
        localStorage.setItem("username", username.trim());

        const response = await fetch(`${import.meta.env.VITE_API_URL}/roomCode`);
        const data = await response.json();
        const code = data.roomCode;

        navigate(`/room/${code}`);
    };

    const handleJoinMeet = async (code) => {
        if (username.trim() === "") {
            setIsUsernameEmpty(true);
            return;
        }
        if (!code.trim()) {
            setRoomCodeError("Please enter a room code");
            return;
        }
        localStorage.setItem("username", username.trim());

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/joinRoom`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    roomCode: code,
                }),
            });

            const data = await response.json();
            const success = data.success;

            if (success) {
                navigate(`/room/${code}`);
            } else {
                setRoomCodeError("Invalid room code — no active meeting found");
            }
        } catch {
            setRoomCodeError("Could not connect to server");
        }
    };

    const inputStyle = (hasError) => ({
        width: "100%",
        padding: "12px 14px",
        borderRadius: "14px",
        border: hasError ? `2px solid ${palette.coral}` : `2px solid ${palette.lilac}`,
        background: palette.mist,
        color: palette.ink,
        fontFamily: fontBody,
        fontWeight: 600,
        fontSize: "14px",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color .15s ease",
    });

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: palette.mist,
                padding: "20px",
                position: "relative",
                overflow: "hidden",
                fontFamily: fontBody,
            }}>
            <ComfyBackdrop />

            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    maxWidth: "380px",
                    background: palette.card,
                    borderRadius: "28px",
                    padding: "36px 30px 32px",
                    boxShadow: shadowPop,
                }}>
                <span style={{
                    display: "inline-block",
                    background: palette.lilac,
                    color: palette.ink,
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "6px 14px",
                    borderRadius: "100px",
                    marginBottom: "14px",
                    letterSpacing: "0.4px",
                }}>
                    🌙 nook
                </span>

                <h2
                    style={{
                        color: palette.ink,
                        fontFamily: fontDisplay,
                        fontWeight: 600,
                        fontSize: "24px",
                        margin: "0 0 4px",
                    }}>
                    Video Meet
                </h2>
                <p
                    style={{
                        color: palette.inkSoft,
                        fontSize: "14px",
                        margin: "0 0 24px",
                    }}>
                    Start a new meeting or join one with a code
                </p>

                <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        if (e.target.value.trim() !== "") {
                            setIsUsernameEmpty(false);
                        }
                    }}
                    placeholder="Enter username"
                    style={inputStyle(isUsernameEmpty)}
                />
                <p
                    style={{
                        display: !isUsernameEmpty ? "none" : "block",
                        color: "#c8564d",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        margin: "6px 0 0",
                    }}>
                    Username required
                </p>

                <button
                    onClick={handleStartMeet}
                    style={{
                        width: "100%",
                        marginTop: "18px",
                        padding: "13px 14px",
                        borderRadius: "16px",
                        border: "none",
                        background: `linear-gradient(135deg, ${palette.violet}, ${palette.blue})`,
                        color: "#fff",
                        fontFamily: fontBody,
                        fontWeight: 700,
                        fontSize: "14px",
                        cursor: "pointer",
                        boxSizing: "border-box",
                        boxShadow: shadowSoft,
                        transition: "transform .15s ease, box-shadow .15s ease",
                    }}>
                    Start meet
                </button>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        margin: "24px 0",
                    }}>
                    <div style={{ flex: 1, height: "2px", background: palette.lilac, borderRadius: "2px" }} />
                    <span style={{ color: palette.inkSoft, fontSize: "12px", fontWeight: 700 }}>or</span>
                    <div style={{ flex: 1, height: "2px", background: palette.lilac, borderRadius: "2px" }} />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                    <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => {
                            setRoomCode(e.target.value);
                            if (roomCodeError) setRoomCodeError("");
                        }}
                        placeholder="Enter room code"
                        onKeyDown={(e) => e.key === "Enter" && handleJoinMeet(roomCode)}
                        style={{
                            ...inputStyle(!!roomCodeError),
                            flex: 1,
                            minWidth: 0,
                        }}
                    />
                    <button
                        onClick={() => handleJoinMeet(roomCode)}
                        style={{
                            padding: "12px 20px",
                            borderRadius: "14px",
                            border: `2px solid ${palette.lilac}`,
                            background: palette.card,
                            color: palette.ink,
                            fontFamily: fontBody,
                            fontWeight: 700,
                            fontSize: "14px",
                            cursor: "pointer",
                            flexShrink: 0,
                            boxShadow: shadowSoft,
                            transition: "transform .15s ease",
                        }}>
                        Join
                    </button>
                </div>

                {roomCodeError && (
                    <p
                        style={{
                            color: "#c8564d",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            margin: "8px 0 0",
                        }}>
                        {roomCodeError}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Home;