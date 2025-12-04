export const themes = {
  tactical: {
    name: "Black Market",

    // --- 1. Backgrounds ---
    "--bg-primary": "#0b0c10",
    "--bg-secondary": "#15161b",
    "--bg-tertiary": "#1f2128", // Đã update từ #1f2026 sang #1f2128 theo Figma
    "--bg-input": "#15161b", // Mới
    "--bg-switch": "#333333", // Mới

    // --- 2. Typography ---
    "--text-main": "#d1d5db",
    "--text-muted": "#9ca3af",
    "--text-inverse": "#0b0c10",

    // --- 3. Actions & Accents ---
    "--accent-color": "#ff9900",
    "--accent-hover": "#ff8800", // Update sáng hơn theo Figma
    "--accent-light": "#ffaa33", // Mới
    "--accent-dark": "#cc7a00", // Mới
    "--accent-glow": "rgba(255, 153, 0, 0.15)",
    "--accent-ring": "#ff9900", // Update từ rgba sang hex solid theo Figma

    // --- 4. Borders & Lines ---
    "--border-color": "#333333",
    "--radius": "8px",

    // --- 5. Status Indicators ---
    "--status-success": "#00C950",
    "--status-error": "#ef4444",
    "--status-warning": "#ff9900",
    "--status-info": "#3b82f6",

    // --- 6. Charts (MỚI) ---
    "--chart-1": "#ff9900",
    "--chart-2": "#ffaa33",
    "--chart-3": "#cc7a00",
    "--chart-4": "#666666",
    "--chart-5": "#999999",

    // --- 7. Sidebar (MỚI) ---
    "--sidebar-bg": "#0b0c10",
    "--sidebar-fg": "#d1d5db",
    "--sidebar-primary": "#ff9900",
    "--sidebar-primary-fg": "#0b0c10",
    "--sidebar-accent": "#15161b",
    "--sidebar-accent-fg": "#d1d5db",
    "--sidebar-border": "#333333",
    "--sidebar-ring": "#ff9900",

    // --- 8. Component Specifics ---
    "--font-display": "'Open Sans', sans-serif",

    // Buttons (Cập nhật màu nền theo biến mới)
    "--btn-secondary-bg": "#1f2128", // Khớp với bg-tertiary
    "--btn-secondary-hover": "#2d3039", // Sáng hơn xíu
    "--btn-secondary-text": "#d1d5db",

    "--btn-destructive-bg": "#ef4444",
    "--btn-destructive-hover": "#dc2626",
    "--btn-destructive-text": "#ffffff",

    "--btn-ghost-hover-bg": "rgba(255, 153, 0, 0.1)",
  },
  light: {
    name: "Clean Day",

    // --- 1. Backgrounds ---
    "--bg-primary": "#ffffff", // Nền trắng tinh khôi
    "--bg-secondary": "#f9fafb", // Xám rất nhạt (Gray 50) cho vùng phụ
    "--bg-tertiary": "#f3f4f6", // Xám nhạt (Gray 100) cho thẻ/card
    "--bg-input": "#ffffff", // Input nền trắng
    "--bg-switch": "#e5e7eb", // Switch nền xám (Gray 200)

    // --- 2. Typography ---
    "--text-main": "#111827", // Đen xám (Gray 900) dễ đọc hơn đen tuyền
    "--text-muted": "#6b7280", // Xám trung tính (Gray 500)
    "--text-inverse": "#ffffff", // Chữ trắng (khi nằm trên nền cam)

    // --- 3. Actions & Accents (Giữ Brand Orange nhưng tinh chỉnh) ---
    "--accent-color": "#ff9900",
    "--accent-hover": "#e68a00", // Hover đậm hơn chút để nổi trên nền sáng
    "--accent-light": "#ffb84d",
    "--accent-dark": "#cc7a00",
    "--accent-glow": "rgba(255, 153, 0, 0.2)", // Tăng opacity glow chút cho rõ
    "--accent-ring": "#ff9900",

    // --- 4. Borders & Lines ---
    "--border-color": "#e5e7eb", // Viền xám nhạt (Gray 200)
    "--radius": "8px",

    // --- 5. Status Indicators (Tối hơn chút để rõ trên nền trắng) ---
    "--status-success": "#16a34a", // Green 600
    "--status-error": "#dc2626", // Red 600
    "--status-warning": "#ea580c", // Orange 600
    "--status-info": "#2563eb", // Blue 600

    // --- 6. Charts ---
    "--chart-1": "#ff9900",
    "--chart-2": "#f97316", // Orange 500
    "--chart-3": "#ea580c", // Orange 600
    "--chart-4": "#9ca3af", // Gray 400
    "--chart-5": "#d1d5db", // Gray 300

    // --- 7. Sidebar ---
    "--sidebar-bg": "#ffffff",
    "--sidebar-fg": "#374151", // Gray 700
    "--sidebar-primary": "#ff9900",
    "--sidebar-primary-fg": "#ffffff",
    "--sidebar-accent": "#f3f4f6", // Gray 100
    "--sidebar-accent-fg": "#111827", // Gray 900
    "--sidebar-border": "#e5e7eb", // Gray 200
    "--sidebar-ring": "#ff9900",

    // --- 8. Component Specifics ---
    "--font-display": "'Open Sans', sans-serif",

    // Buttons
    "--btn-secondary-bg": "#f3f4f6", // Nền nút phụ màu xám nhạt
    "--btn-secondary-hover": "#e5e7eb", // Hover đậm hơn chút
    "--btn-secondary-text": "#111827", // Chữ đen

    "--btn-destructive-bg": "#ef4444",
    "--btn-destructive-hover": "#dc2626",
    "--btn-destructive-text": "#ffffff",

    "--btn-ghost-hover-bg": "rgba(255, 153, 0, 0.1)",
  },
} as const;

export type ThemeKey = keyof typeof themes;
