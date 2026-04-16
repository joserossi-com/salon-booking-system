import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #C4973D 0%, #D4B96A 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          fontSize: 14,
          fontWeight: 700,
          color: "#1A1414",
          fontStyle: "italic",
          letterSpacing: "-0.5px",
        }}
      >
        KS
      </div>
    ),
    { ...size }
  );
}
