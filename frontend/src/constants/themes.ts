export const themes = {
  tactical: {
    name: "Black Market",

    // ... (Giữ nguyên các phần 1, 2, 3, 4, 5, 6 cũ) ...
    // --- 1. Backgrounds ---
    "--bg-primary": "#0b0c10",
    "--bg-secondary": "#15161b",
    "--bg-tertiary": "#1f2026",

    // --- 2. Typography ---
    "--text-main": "#d1d5db",
    "--text-muted": "#9ca3af",
    "--text-inverse": "#0b0c10",

    // --- 3. Actions & Accents ---
    "--accent-color": "#ff9900",
    "--accent-hover": "#e68a00",
    "--accent-glow": "rgba(255, 153, 0, 0.15)",
    "--accent-ring": "rgba(255, 153, 0, 0.5)",

    // --- 4. Borders & Lines ---
    "--border-color": "#333333",
    "--radius": "8px",

    // --- 5. Status Indicators ---
    "--status-success": "#00C950",
    "--status-error": "#ef4444",
    "--status-warning": "#ff9900",
    "--status-info": "#3b82f6",

    // --- 6. Font Settings ---
    "--font-display": "Open Sans, sans-serif",

    // --- 7. Component Specifics - Buttons (MỚI THÊM) ---
    // Secondary
    "--btn-secondary-bg": "#1F2128",
    "--btn-secondary-hover": "#334155",
    "--btn-secondary-text": "#D1D5DB",

    // Destructive
    "--btn-destructive-bg": "#ef4444",
    "--btn-destructive-hover": "#dc2626",
    "--btn-destructive-text": "#ffffff",

    // Outline
    "--btn-outline-bg": "#0B0C10",
    "--btn-outline-border-color": "#333333",
    "--btn-outline-text": "#D1D5DB",

    // Ghost
    "--btn-ghost-text": "#D1D5DB",
    "--btn-ghost-hover-bg": "#ff9900",
    "--btn-ghost-hover-text": "#ffffff",

    // Link
    "--btn-link-text": "#D1D5DB",
    "--btn-link-hover-bg": "#ff9900",
    "--btn-link-hover-text": "#ffffff",
  },
} as const;

export type ThemeKey = keyof typeof themes;

// luxury: {
//   name: "Luxury Gold",
//   "--bg-primary": "#050505",
//   "--bg-secondary": "#121212",
//   "--text-main": "#f3f4f6",
//   "--text-muted": "#6b7280",
//   "--accent-color": "#d4af37",
//   "--accent-hover": "#b5952f",
//   "--border-color": "#444444",
//   "--font-display": "Open Sans, sans-serif",
//   "--radius": "4px",
// },
//   cyberpunk: {
//     name: "Neon City",
//     "--bg-primary": "#050510",
//     "--bg-secondary": "#0a0a16",
//     "--text-main": "#ccfbf1",
//     "--text-muted": "#5eead4",
//     "--accent-color": "#00ff9d",
//     "--accent-hover": "#00cc7d",
//     "--border-color": "#1a1a3a",
//     "--font-display": "sans-serif",
//     "--radius": "0px",
//   },
