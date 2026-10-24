import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";

// GET /api/test seeds the database (admin only). Needs DATABASE_URL and
// migrated tables.
export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ success: false, error: "Admin login required" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { success: false, error: "DATABASE_URL is not set" },
      { status: 503 },
    );
  }

  try {
    const { seed } = await import("@/db/seed");
    await seed();
    return NextResponse.json({
      success: true,
      data: "Data seeded successfully",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: "Database seeding failed" },
      { status: 500 },
    );
  }
}
