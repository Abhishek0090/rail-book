import { getAdminStats } from "@/data/admin";
import { adminRoute } from "@/lib/adminApi";

// GET /api/admin/stats  (admin only)
export async function GET() {
  return adminRoute(getAdminStats, 200);
}
