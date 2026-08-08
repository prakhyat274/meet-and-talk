import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../App.css";

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

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: "#0d0d0f",
                padding: "20px",
            }}>
            <div
                style={{
                    width: "100%",
                    maxWidth: "380px",
                    background: "#1c1c1f",
                    border: "1px solid #2a2a2e",
                    borderRadius: "16px",
                    padding: "32px 28px",
                }}>
                <h2
                    style={{
                        color: "#f4f4f5",
                        fontWeight: 600,
                        fontSize: "22px",
                        margin: "0 0 4px",
                    }}>
                    Video Meet
                </h2>
                <p
                    style={{
                        color: "#8a8a92",
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
                    style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: isUsernameEmpty ? "1px solid #f87171" : "1px solid #2a2a2e",
                        background: "#111114",
                        color: "#e4e4e7",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                    }}
                />
                <p
                    style={{
                        display: !isUsernameEmpty ? "none" : "block",
                        color: "#f87171",
                        fontSize: "12.5px",
                        margin: "6px 0 0",
                    }}>
                    Username required
                </p>

                <button
                    onClick={handleStartMeet}
                    style={{
                        width: "100%",
                        marginTop: "18px",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "none",
                        background: "#6366f1",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: "pointer",
                        boxSizing: "border-box",
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
                    <div style={{ flex: 1, height: "1px", background: "#2a2a2e" }} />
                    <span style={{ color: "#5a5a60", fontSize: "12px" }}>or</span>
                    <div style={{ flex: 1, height: "1px", background: "#2a2a2e" }} />
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
                            flex: 1,
                            minWidth: 0,
                            padding: "12px 14px",
                            borderRadius: "10px",
                            border: roomCodeError
                                ? "1px solid #f87171"
                                : "1px solid #2a2a2e",
                            background: "#111114",
                            color: "#e4e4e7",
                            fontSize: "14px",
                            outline: "none",
                            boxSizing: "border-box",
                        }}
                    />
                    <button
                        onClick={() => handleJoinMeet(roomCode)}
                        style={{
                            padding: "12px 18px",
                            borderRadius: "10px",
                            border: "1px solid #2a2a2e",
                            background: "#111114",
                            color: "#f4f4f5",
                            fontWeight: 600,
                            fontSize: "14px",
                            cursor: "pointer",
                            flexShrink: 0,
                        }}>
                        Join
                    </button>
                </div>

                {roomCodeError && (
                    <p
                        style={{
                            color: "#f87171",
                            fontSize: "12.5px",
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

