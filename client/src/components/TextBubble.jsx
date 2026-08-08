// ---- comfy palette tokens (matches Room.jsx / Home.jsx) ----
const palette = {
    violet: "#B1B2FF",
    mist: "#EEF1FF",
    ink: "#3E3D63",
    inkSoft: "#6B6A93",
};
const fontBody = "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function TextBubble({ data, id, index }) {
    const isMine = data.socketID === id;

    return (
        <div
            key={index}
            style={{
                display: "flex",
                flexDirection: "column",
                alignSelf: isMine ? "flex-end" : "flex-start",
                maxWidth: "80%",
                fontFamily: fontBody,
            }}>
            <span
                style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: palette.inkSoft,
                    textAlign: "right",
                    paddingRight: "2px",
                }}>
                {data.timeStamp}
            </span>

            <div
                style={{
                    position: "relative",
                    padding: "9px 13px",
                    borderRadius: isMine ? "16px 16px 6px 16px" : "16px 16px 16px 6px",
                    background: isMine ? palette.violet : palette.mist,
                    border: "none",
                    color: isMine ? "#fff" : palette.ink,
                }}>
                {!isMine && (
                    <div
                        style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: palette.inkSoft,
                            marginBottom: "2px",
                        }}>
                        {data.sender}
                    </div>
                )}

                <span
                    style={{
                        fontSize: "13px",
                        lineHeight: 1.4,
                        wordBreak: "break-word",
                        display: "block",
                        fontWeight: 600,
                    }}>
                    {data.message}
                </span>
            </div>
        </div>
    );
}
