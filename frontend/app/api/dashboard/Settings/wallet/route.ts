import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wallet } = await req.json();

    await pool.query(
      "UPDATE users SET wallet = ? WHERE id = ?",
      [wallet, session.user.id]
    );

    return NextResponse.json({ success: true, message: "Wallet updated!" });
  } catch (error) {
    console.error("Wallet update error:", error);
    return NextResponse.json({ error: "Failed to update wallet" }, { status: 500 });
  }
}
