import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
import Notification from "../components/Notification";
import RoomHeader from "../components/RoomHeader";
import ParticipantsGrid from "../components/ParticipantsGrid";
import ControlBar from "../components/ControlBar";
import ChatPanel from "../components/ChatPanel";
import useRoomSocket from "../hooks/useRoomSocket";
import useWebRTC from "../hooks/useWebRTC";
import ParticipantTile from "../components/ParticipantTile";
import { MicIcon, MicOffIcon, CameraIcon, CameraOffIcon } from "../components/icons";

// ---- comfy palette tokens ----
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
        { size: 280, top: -80, left: -60, bg: palette.lilac, opacity: 0.55 },
        { size: 200, bottom: -60, right: "6%", bg: palette.blue, opacity: 0.5 },
        { size: 150, top: "40%", right: -60, bg: palette.violet, opacity: 0.22 },
        { size: 120, bottom: "10%", left: "8%", bg: palette.coral, opacity: 0.16 },
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

export default function Room() {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const username = localStorage.getItem("username") ?? "Anonymous";

    const [hasJoined, setHasJoined] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const {
        localStream,
        remoteStreams,
        isMicOn,
        isCameraOn,
        mediaError,
        isMediaReady,
        toggleMic,
        toggleCamera,
    } = useWebRTC(roomCode);

    const { chat, notifications, participantsList, sendMessage } =
        useRoomSocket(roomCode, username, isMicOn, isCameraOn, isMediaReady && hasJoined);

    const handleLeaveCall = () => {
        // Leave the room and redirect to home
        socket.emit("leave-room");
        navigate("/");
        // Clean up media streams
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
    };

    const toggleBtnStyle = (isOn) => ({
        width: "52px",
        height: "52px",
        borderRadius: "18px",
        border: "none",
        cursor: "pointer",
        background: isOn ? palette.card : palette.coral,
        color: isOn ? palette.ink : "#fff",
        boxShadow: shadowSoft,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform .15s ease, box-shadow .15s ease, background .2s ease",
    });

    if (!hasJoined) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: palette.mist,
                color: palette.ink,
                fontFamily: fontBody,
                position: "relative",
                overflow: "hidden",
            }}>
                <ComfyBackdrop />

                <div style={{
                    position: "relative",
                    zIndex: 1,
                    background: palette.card,
                    borderRadius: "32px",
                    padding: "36px 40px 32px",
                    boxShadow: shadowPop,
                    width: "min(420px, 92vw)",
                    textAlign: "center",
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
                        🌙 room: {roomCode}
                    </span>

                    <h1 style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: "28px", color: palette.ink, margin: "0 0 6px" }}>
                        Ready to join?
                    </h1>
                    <p style={{ color: palette.inkSoft, fontSize: "14px", margin: "0 0 20px" }}>
                        Fluff the pillows, check your mic, and hop in whenever you're comfy.
                    </p>

                    {mediaError && (
                        <div style={{
                            padding: "10px 16px",
                            marginBottom: "16px",
                            background: "rgba(247, 144, 136, 0.15)",
                            border: `1px solid ${palette.coral}`,
                            borderRadius: "14px",
                            color: "#c8564d",
                            fontSize: "13px",
                            textAlign: "left",
                        }}>
                            ⚠ Camera/microphone access issue: {mediaError}
                        </div>
                    )}

                    <div style={{
                        display: "grid",
                        width: "100%",
                        aspectRatio: "4 / 3",
                        marginTop: mediaError ? "16px" : 0,
                        marginBottom: "22px",
                        borderRadius: "26px",
                        overflow: "hidden",
                        boxShadow: `inset 0 0 0 3px rgba(255,255,255,0.6)`,
                        background: `linear-gradient(160deg, ${palette.lilac}, ${palette.blue})`,
                    }}>
                        {isMediaReady ? (
                            <ParticipantTile
                                username={username}
                                stream={localStream}
                                isLocal={true}
                                isMicOn={isMicOn}
                                isCameraOn={isCameraOn}
                            />
                        ) : (
                            <div style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: palette.inkSoft,
                                fontFamily: fontBody,
                                fontWeight: 600,
                            }}>
                                Loading media...
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: "14px", justifyContent: "center", marginBottom: "26px" }}>
                        <button onClick={toggleMic} style={toggleBtnStyle(isMicOn)}>
                            {isMicOn ? <MicIcon /> : <MicOffIcon />}
                        </button>
                        <button onClick={toggleCamera} style={toggleBtnStyle(isCameraOn)}>
                            {isCameraOn ? <CameraIcon /> : <CameraOffIcon />}
                        </button>
                    </div>

                    <button
                        onClick={() => setHasJoined(true)}
                        disabled={!isMediaReady}
                        style={{
                            width: "100%",
                            padding: "15px",
                            fontSize: "16px",
                            fontFamily: fontBody,
                            fontWeight: 700,
                            borderRadius: "20px",
                            border: "none",
                            background: isMediaReady
                                ? `linear-gradient(135deg, ${palette.violet}, ${palette.blue})`
                                : palette.lilac,
                            color: isMediaReady ? "#fff" : palette.inkSoft,
                            boxShadow: isMediaReady ? shadowPop : "none",
                            cursor: isMediaReady ? "pointer" : "not-allowed",
                            transition: "transform .15s ease",
                        }}
                    >
                        {isMediaReady ? "Join room" : "Please wait..."}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                background: palette.mist,
                overflow: "hidden",
                position: "relative",
                fontFamily: fontBody,
                color: palette.ink,
            }}>
            <ComfyBackdrop />

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    padding: "24px 28px",
                    minWidth: 0,
                    minHeight: 0,
                    overflow: "hidden",
                    position: "relative",
                    zIndex: 1,
                }}>
                <RoomHeader
                    roomCode={roomCode}
                    participantCount={participantsList.length}
                    isChatOpen={isChatOpen}
                    onToggleChat={() => setIsChatOpen((prev) => !prev)}
                />

                {mediaError && (
                    <div
                        style={{
                            padding: "10px 16px",
                            marginBottom: "12px",
                            background: "rgba(247, 144, 136, 0.15)",
                            border: `1px solid ${palette.coral}`,
                            borderRadius: "14px",
                            color: "#c8564d",
                            fontSize: "13px",
                            flexShrink: 0,
                        }}>
                        ⚠ Camera/microphone access issue: {mediaError}
                    </div>
                )}

                <ParticipantsGrid
                    participants={participantsList}
                    localStream={localStream}
                    remoteStreams={remoteStreams}
                    currentSocketId={socket.id}
                />

                <ControlBar
                    isMicOn={isMicOn}
                    onToggleMic={toggleMic}
                    isCameraOn={isCameraOn}
                    onToggleCamera={toggleCamera}
                    onLeaveCall={handleLeaveCall}
                />
            </div>

            {isChatOpen && <ChatPanel chat={chat} onSendMessage={sendMessage} />}

            {notifications.map((noti) => (
                <Notification text={noti.text} key={noti.id} />
            ))}
        </div>
    );
}