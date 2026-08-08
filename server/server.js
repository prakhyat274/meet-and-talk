import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const PORT = process.env.PORT || 5000;

const io = new Server(httpServer, {
    cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    },
});

app.use(
    cors({
        origin: FRONTEND_URL,
    })
);

app.use(express.json());

const roomsToUser = new Map();

const generateUniqueRoomCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    for (let l = 1; l <= 6; l++) {
        code += characters[
            Math.floor(Math.random() * characters.length)
        ];
    }

    if (roomsToUser.has(code)) {
        return generateUniqueRoomCode();
    }

    return code;
};

function removeUser(socket) {
    const roomCode = socket.data.roomCode;

    if (!roomCode) return;

    const users = roomsToUser.get(roomCode);

    if (!users) return;

    const remainingUsers = users.filter(
        (user) => user.socketId !== socket.id
    );

    if (remainingUsers.length === 0) {
        roomsToUser.delete(roomCode);
    } else {
        roomsToUser.set(roomCode, remainingUsers);
    }

    socket.to(roomCode).emit("notify-room", {
        roomCode,
        username: socket.data.username,
        text: "has left the meet",
    });
}

app.get("/roomCode", (req, res) => {
    const roomCode = generateUniqueRoomCode();

    res.json({ roomCode });
});

app.post("/joinRoom", (req, res) => {
    const { roomCode } = req.body;

    res.json({
        success: roomsToUser.has(roomCode),
    });
});

io.on("connection", (socket) => {
    socket.on("join-room", (data) => {
        socket.data.roomCode = data.roomCode;
        socket.data.username = data.username;

        const existingUsers =
            roomsToUser.get(socket.data.roomCode) ?? [];

        // Notify existing peers
        socket
            .to(socket.data.roomCode)
            .emit("user-joined", {
                socketId: socket.id,
                username: socket.data.username,
            });

        existingUsers.push({
            socketId: socket.id,
            username: socket.data.username,
            isMicOn: false,
            isCameraOn: false,
        });

        roomsToUser.set(
            socket.data.roomCode,
            existingUsers
        );

        socket.join(socket.data.roomCode);

        socket
            .to(socket.data.roomCode)
            .emit("notify-room", {
                ...data,
                text: "has joined the meet",
            });

        io.to(socket.data.roomCode).emit(
            "update-participants",
            roomsToUser.get(socket.data.roomCode) ?? []
        );
    });

    socket.on("leave-room", () => {
        const roomCode = socket.data.roomCode;

        if (!roomCode) return;

        removeUser(socket);

        socket.leave(roomCode);

        io.to(roomCode).emit("user-left", {
            socketId: socket.id,
        });

        io.to(roomCode).emit(
            "update-participants",
            roomsToUser.get(roomCode) ?? []
        );

        socket.data.roomCode = undefined;
        socket.data.username = undefined;
    });

    socket.on("send-message", (data) => {
        io.to(data.roomCode).emit("receive-message", {
            ...data,
            socketID: socket.id,
        });
    });

    socket.on("toggle-mic", (data) => {
        const users = roomsToUser.get(socket.data.roomCode);

        if (!users) return;

        users.forEach((user) => {
            if (user.socketId === socket.id) {
                user.isMicOn =
                    data?.isMicOn ?? !user.isMicOn;
            }
        });

        io.to(socket.data.roomCode).emit(
            "update-participants",
            users
        );
    });

    socket.on("toggle-camera", (data) => {
        const users = roomsToUser.get(socket.data.roomCode);

        if (!users) return;

        users.forEach((user) => {
            if (user.socketId === socket.id) {
                user.isCameraOn =
                    data?.isCameraOn ?? !user.isCameraOn;
            }
        });

        io.to(socket.data.roomCode).emit(
            "update-participants",
            users
        );
    });

    // WebRTC Signaling

    socket.on(
        "webrtc-offer",
        ({ targetSocketId, offer }) => {
            io.to(targetSocketId).emit(
                "webrtc-offer",
                {
                    senderSocketId: socket.id,
                    offer,
                }
            );
        }
    );

    socket.on(
        "webrtc-answer",
        ({ targetSocketId, answer }) => {
            io.to(targetSocketId).emit(
                "webrtc-answer",
                {
                    senderSocketId: socket.id,
                    answer,
                }
            );
        }
    );

    socket.on(
        "ice-candidate",
        ({ targetSocketId, candidate }) => {
            io.to(targetSocketId).emit(
                "ice-candidate",
                {
                    senderSocketId: socket.id,
                    candidate,
                }
            );
        }
    );

    // Disconnect

    socket.on("disconnect", () => {
        const roomCode = socket.data.roomCode;

        if (!roomCode) return;

        removeUser(socket);

        io.to(roomCode).emit("user-left", {
            socketId: socket.id,
        });

        io.to(roomCode).emit(
            "update-participants",
            roomsToUser.get(roomCode) ?? []
        );
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server Running At Port ${PORT}`);
});