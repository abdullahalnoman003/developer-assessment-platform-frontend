import { ImageResponse } from "next/og";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const alt = APP_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INDIGO = "#818cf8";
const CYAN = "#22d3ee";
const ZINC_300 = "#a1a1aa";
const ZINC_500 = "#71717a";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
        padding: "72px",
        backgroundColor: "#0b0b12",
        backgroundImage: `linear-gradient(${INDIGO}22 1px, transparent 1px), linear-gradient(90deg, ${INDIGO}22 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        color: "#f5f5f7",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: `1px solid ${CYAN}`,
          padding: "10px 20px",
          fontSize: 26,
          color: CYAN,
        }}
      >
        developer assessment platform
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {APP_NAME}
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 900,
            fontSize: 40,
            lineHeight: 1.3,
            color: ZINC_300,
          }}
        >
          {APP_TAGLINE}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          fontSize: 26,
          color: ZINC_500,
        }}
      >
        <span style={{ display: "flex" }}>MCQ auto-grading</span>
        <span style={{ display: "flex" }}>|</span>
        <span style={{ display: "flex" }}>Written + coding review</span>
        <span style={{ display: "flex" }}>|</span>
        <span style={{ display: "flex" }}>Release-controlled results</span>
      </div>
    </div>,
    size,
  );
}
