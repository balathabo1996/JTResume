import React from "react";

export default function DesignSettingsSidebar({
  templateStyle, setTemplateStyle,
  accentColor, setAccentColor,
  fontPairing, setFontPairing,
  spacingTuning, setSpacingTuning
}) {
  const colors = [
    { name: "Classic Trust (Navy)", hex: "#1e3a8a" },
    { name: "Modern Innovation (Indigo)", hex: "#4f46e5" },
    { name: "Growth & Stability (Forest)", hex: "#064e3b" },
    { name: "Bold Influence (Crimson)", hex: "#881337" },
    { name: "Executive Elegance (Charcoal)", hex: "#334155" },
    { name: "Creative Corporate (Teal)", hex: "#0d9488" },
    { name: "Clean Tech (Steel Blue)", hex: "#0369a1" },
    { name: "Warm Terracotta (Amber)", hex: "#b45309" },
    { name: "Midnight Sapphire (Slate)", hex: "#0f172a" },
    { name: "Rich Burgundy (Plum)", hex: "#701a75" },
  ];

  return (
    <div
      className="canvas-settings-bar mb-4 mx-auto"
      style={{
        maxWidth: "880px",
        width: "100%",
        background: "rgba(15,20,40,0.7)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        padding: "24px",
      }}
    >
      {/* Row 1: Resume Layout Templates Selector */}
      <div className="d-flex flex-column gap-3 mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "1px", color: "#6366f1", textTransform: "uppercase" }}>
            Step 1 — Select Resume Layout
          </span>
          <span style={{ fontSize: "0.63rem", background: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "999px", padding: "2px 10px", fontWeight: 600 }}>
            All ATS-Optimized
          </span>
        </div>
        <div className="row g-2">
          {[
            { id: "classic", label: "Classic Formal", desc: "Traditional centered serif for finance, law, & consulting" },
            { id: "modern", label: "Modern Minimalist", desc: "Sleek, highly polished standard for general corporate sectors" },
            { id: "creative", label: "Creative Executive", desc: "Premium 2-column sidebar design to maximize layout hierarchy" },
            { id: "executive", label: "Executive Prestige", desc: "Bold, structured corporate header layout for leadership impact" },
            { id: "tech", label: "Tech Minimalist", desc: "High-density tech presentation with dynamic skill badge rows" },
            { id: "academic", label: "Academic Editorial", desc: "Double-border editorial serif designed for researchers & scholars" },
            { id: "terminal", label: "The Developer Terminal", desc: "A radical dark-mode CLI layout built exclusively for engineers" },
          ].map((tpl) => (
            <div className="col-md-4 col-sm-6" key={tpl.id}>
              <button
                type="button"
                className={`template-card-btn w-100 text-start d-flex flex-column justify-content-center ${templateStyle === tpl.id ? "active" : ""}`}
                onClick={() => setTemplateStyle(tpl.id)}
                style={{
                  background: templateStyle === tpl.id ? "rgba(99,102,241,0.1)" : "transparent",
                  border: templateStyle === tpl.id ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  transition: "all 0.2s",
                  minHeight: "85px",
                }}
              >
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: templateStyle === tpl.id ? "#818cf8" : "#f1f5f9", marginBottom: "4px" }}>
                  {tpl.label}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#64748b", lineHeight: "1.3" }}>
                  {tpl.desc}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="row g-3">
        {/* Color Accent Palette */}
        <div className="col-lg-4 col-md-12 d-flex flex-column gap-2 border-end border-secondary border-opacity-25 pe-lg-4">
          <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "1px", color: "#6366f1", textTransform: "uppercase" }}>
            Step 2 — Accent
          </span>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "conic-gradient(from 90deg, #f87171, #fbbf24, #34d399, #38bdf8, #818cf8, #f472b6, #f87171)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 10px rgba(0,0,0,0.5)" }}>
              <span style={{ fontSize: "14px" }}>✨</span>
            </div>
            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)", margin: "0 2px" }}></div>
            {colors.map((color) => (
              <button
                key={color.name}
                style={{
                  backgroundColor: color.hex, width: "24px", height: "24px", borderRadius: "50%",
                  border: accentColor === color.hex ? "2px solid #fff" : "2px solid rgba(255,255,255,0.2)",
                  outline: accentColor === color.hex ? `3px solid ${color.hex}` : "none", outlineOffset: "2px",
                  boxShadow: accentColor === color.hex ? `0 0 10px ${color.hex}99` : "inset 0 0 0 1px rgba(255,255,255,0.15)",
                  cursor: "pointer", transition: "all 0.2s", position: "relative",
                }}
                onClick={() => setAccentColor(color.hex)}
                title={color.name}
              >
                {accentColor === color.hex && (
                  <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "#fff", fontSize: "9px", fontWeight: 700 }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Typography Presets Selector */}
        <div className="col-lg-4 col-md-12 d-flex flex-column gap-2">
          <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "1px", color: "#6366f1", textTransform: "uppercase" }}>
            Step 3 — Typography
          </span>
          <div className="d-flex flex-wrap gap-2">
            {[
              { id: "modern", label: "Inter & Inter" },
              { id: "editorial", label: "Playfair & Merriweather" },
              { id: "tech", label: "Roboto Mono & Inter" },
              { id: "classic", label: "Roboto & Merriweather" },
              { id: "elegant", label: "Inter & Lora" },
            ].map((pair) => (
              <button
                key={pair.id}
                type="button"
                className={`settings-pill-btn ${fontPairing === pair.id ? "active" : ""}`}
                onClick={() => setFontPairing(pair.id)}
                style={{ padding: "6px 12px", fontSize: "0.75rem", flex: "1 1 auto", whiteSpace: "nowrap" }}
              >
                {pair.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spacing Fit Selector */}
        <div className="col-lg-4 col-md-12 d-flex flex-column gap-2">
          <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "1px", color: "#6366f1", textTransform: "uppercase" }}>
            Step 4 — Spacing
          </span>
          <div className="d-flex flex-wrap gap-2">
            {[
              { id: "compact", label: "Compact" },
              { id: "normal", label: "Normal" },
              { id: "relaxed", label: "Relaxed" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                className={`settings-pill-btn ${spacingTuning === s.id ? "active" : ""}`}
                onClick={() => setSpacingTuning(s.id)}
                style={{ flex: "1 1 auto", padding: "6px 0", textAlign: "center", fontSize: "0.75rem" }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
