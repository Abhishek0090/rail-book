import { NextResponse } from "next/server";

// GET /api/test seeds the database. Needs DATABASE_URL and migrated tables.
export async function GET() {
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
