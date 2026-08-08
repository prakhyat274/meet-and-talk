// ---- comfy palette tokens (matches Room.jsx / Home.jsx) ----
const palette = {
    ink: "#3E3D63",
    card: "#FFFFFF",
    mintDeep: "#7FD9AE",
};
const fontBody = "'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const shadowPop = "0 14px 32px rgba(120, 120, 200, 0.26)";

export default function Notification({ id, text }) {
    return (
        <div
            key={id}
            style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                borderRadius: "16px",
                background: palette.card,
                border: "none",
                boxShadow: shadowPop,
                color: palette.ink,
                fontFamily: fontBody,
                fontSize: "13px",
                fontWeight: 700,
                maxWidth: "280px",
                zIndex: 50,
            }}>
            <div
                style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: palette.mintDeep,
                    flexShrink: 0,
                }}
            />
            <span style={{ lineHeight: 1.4, wordBreak: "break-word" }}>{text}</span>
        </div>
    );
}
