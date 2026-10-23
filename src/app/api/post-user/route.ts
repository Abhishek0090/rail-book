import { db } from "@/db";
import { users } from "@/db/schema/users";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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
