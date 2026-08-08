import ParticipantTile from "./ParticipantTile";

export default function ParticipantsGrid({
    participants,
    localStream,
    remoteStreams,
    currentSocketId,
}) {
    return (
        <div
            style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gridAutoRows: "1fr",
                gap: "10px",
                minHeight: 0,
                overflow: "hidden",
                paddingBottom: "64px",
            }}>
            {participants.map((p) => {
                const isLocal = p.socketId === currentSocketId;
                const stream = isLocal ? localStream : remoteStreams.get(p.socketId) || null;

                return (
                    <ParticipantTile
                        key={p.socketId}
                        username={p.username}
                        stream={stream}
                        isLocal={isLocal}
                        isMicOn={p.isMicOn}
                    />
                );
            })}
        </div>
    );
}

