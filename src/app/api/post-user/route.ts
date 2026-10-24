import { db } from "@/db";
import { users } from "@/db/schema/users";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";

// Admin-only raw insert into the PostgreSQL users table. Passengers sign up
// through /register or POST /api/auth/register, which hash the password.
export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json(
      { success: false, message: "Admin login required" },
      { status: 401 },
    );
  }
  try {
    const { name, email, phone, password_hash } = await request.json();

    if (!name || !email || !phone || !password_hash) {
      return NextResponse.json(
        { success: false, message: "Missing required user fields" },
        { status: 400 },
      );
    }

    const insertedUser = await db
      .insert(users)
      .values({
        name,
        email,
        phone,
        password_hash,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: insertedUser[0],
      message: "User created successfully",
    });
  } catch (error) {
    console.error("DB ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Database query failed" },
      { status: 500 },
    );
  }
}
