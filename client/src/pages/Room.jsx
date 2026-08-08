import { useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";
import Notification from "../components/Notification";
import RoomHeader from "../components/RoomHeader";
import ParticipantsGrid from "../components/ParticipantsGrid";
import ControlBar from "../components/ControlBar";
import ChatPanel from "../components/ChatPanel";
import useRoomSocket from "../hooks/useRoomSocket";
import useWebRTC from "../hooks/useWebRTC";

export default function Room() {
    const { roomCode } = useParams();
    const username = localStorage.getItem("username") ?? "Anonymous";

    const { chat, notifications, participantsList, sendMessage } =
        useRoomSocket(roomCode, username);

    const {
        localStream,
        remoteStreams,
        isMicOn,
        isCameraOn,
        mediaError,
        toggleMic,
        toggleCamera,
    } = useWebRTC(roomCode);

    const [isChatOpen, setIsChatOpen] = useState(false);

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
                />
            </div>

            {isChatOpen && <ChatPanel chat={chat} onSendMessage={sendMessage} />}

            {notifications.map((noti) => (
                <Notification text={noti.text} key={noti.id} />
            ))}
        </div>
    );
}

