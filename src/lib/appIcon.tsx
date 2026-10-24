// The RailBook app icon (train on a blue-to-purple tile), drawn as JSX so
// next/og can render it to PNG at any size. Used by the PWA icons and the
// Apple touch icon.
export const BRAND_BLUE = "#2563eb";
export const BRAND_PURPLE = "#9333ea";

export function AppIcon({ size, maskable = false }: { size: number; maskable?: boolean }) {
  // Maskable icons get a safe zone: the OS may crop to a circle or squircle.
  const glyph = Math.round(size * (maskable ? 0.46 : 0.6));
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_PURPLE})`,
        borderRadius: maskable ? 0 : Math.round(size * 0.22),
      }}
    >
      <svg
        width={glyph}
        height={glyph}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 3.1V7a4 4 0 0 0 8 0V3.1" />
        <path d="m9 15-1-1" />
        <path d="m15 15 1-1" />
        <path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z" />
        <path d="m8 19-2 3" />
        <path d="m16 19 2 3" />
      </svg>
    </div>
  );
}
