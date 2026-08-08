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

    if (!hasJoined) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "#0a0a0b",
                color: "#fff",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}>
                <h1 style={{ marginBottom: "20px" }}>Ready to join?</h1>
                
                {mediaError && (
                    <div style={{
                        padding: "10px 16px",
                        marginBottom: "16px",
                        background: "rgba(229, 72, 77, 0.15)",
                        border: "1px solid rgba(229, 72, 77, 0.3)",
                        borderRadius: "8px",
                        color: "#f87171",
                        fontSize: "13px",
                    }}>
                        ⚠ Camera/microphone access issue: {mediaError}
                    </div>
                )}

                <div style={{ width: "400px", height: "300px", marginBottom: "20px" }}>
                    {isMediaReady ? (
                        <ParticipantTile 
                            username={username}
                            stream={localStream}
                            isLocal={true}
                            isMicOn={isMicOn}
                        />
                    ) : (
                        <div style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#131315",
                            borderRadius: "10px",
                            border: "1px solid #1f1f22",
                            color: "#c9c9cd"
                        }}>
                            Loading media...
                        </div>
                    )}
                </div>

                <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
                    <button
                        onClick={toggleMic}
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "10px",
                            border: "none",
                            cursor: "pointer",
                            background: isMicOn ? "#3f3f46" : "#e5484d",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        {isMicOn ? <MicIcon /> : <MicOffIcon />}
                    </button>
                    <button
                        onClick={toggleCamera}
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "10px",
                            border: "none",
                            cursor: "pointer",
                            background: isCameraOn ? "#3f3f46" : "#e5484d",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        {isCameraOn ? <CameraIcon /> : <CameraOffIcon />}
                    </button>
                </div>

                <button
                    onClick={() => setHasJoined(true)}
                    disabled={!isMediaReady}
                    style={{
                        padding: "12px 32px",
                        fontSize: "16px",
                        fontWeight: "600",
                        borderRadius: "8px",
                        border: "none",
                        background: isMediaReady ? "#34d399" : "#3f3f46",
                        color: isMediaReady ? "#000" : "#a1a1aa",
                        cursor: isMediaReady ? "pointer" : "not-allowed",
                    }}
                >
                    {isMediaReady ? "Join Room" : "Please wait..."}
                </button>
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                background: "#0a0a0b",
                overflow: "hidden",
                position: "relative",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}>
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
                            background: "rgba(229, 72, 77, 0.15)",
                            border: "1px solid rgba(229, 72, 77, 0.3)",
                            borderRadius: "8px",
                            color: "#f87171",
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
