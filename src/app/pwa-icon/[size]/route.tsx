import { ImageResponse } from "next/og";
import { AppIcon } from "@/lib/appIcon";

// PNG icons for the web app manifest:
//   /pwa-icon/192, /pwa-icon/512, /pwa-icon/maskable-512
const SIZES: Record<string, { size: number; maskable: boolean }> = {
  "192": { size: 192, maskable: false },
  "512": { size: 512, maskable: false },
  "maskable-512": { size: 512, maskable: true },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const icon = SIZES[(await params).size];
  if (!icon) return new Response("Not found", { status: 404 });

  return new ImageResponse(<AppIcon size={icon.size} maskable={icon.maskable} />, {
    width: icon.size,
    height: icon.size,
    headers: { "Cache-Control": "public, max-age=604800, immutable" },
  });
}
