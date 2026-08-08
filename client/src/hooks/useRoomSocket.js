import { useEffect, useState } from "react";
import socket from "../socket";

export default function useRoomSocket(roomCode, username, isMicOn, isCameraOn, shouldJoin = true) {
    const [chat, setChat] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [participantsList, setParticipantsList] = useState([]);

    useEffect(() => {
        if (!shouldJoin) return;

        const handleReceiveMessage = (data) => {
            setChat((prev) => [...prev, data]);
        };

        socket.emit("join-room", { roomCode, username, isMicOn, isCameraOn });
        socket.on("receive-message", handleReceiveMessage);

        return () => {
            socket.off("receive-message", handleReceiveMessage);
            socket.emit("leave-room");
        };
    }, [roomCode, username, shouldJoin]);

    useEffect(() => {
        const handleRoomNotification = (data) => {
            const newUser = data.username;
            const id = crypto.randomUUID();
            setNotifications((prev) => [...prev, { id, text: `${newUser} ${data.text}` }]);

            setTimeout(() => {
                setNotifications((prev) => prev.filter((p) => p.id !== id));
            }, 3000);
        };

        const handleParticipationUpdate = (participants) => {
            setParticipantsList(participants);
        };

        socket.on("notify-room", handleRoomNotification);
        socket.on("update-participants", handleParticipationUpdate);

        return () => {
            socket.off("notify-room", handleRoomNotification);
            socket.off("update-participants", handleParticipationUpdate);
        };
    }, []);

    const sendMessage = (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const now = new Date();
        const timeStamp = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        socket.emit("send-message", {
            message: trimmed,
            roomCode,
            sender: username,
            timeStamp,
        });
    };

    return { chat, notifications, participantsList, sendMessage };
}

