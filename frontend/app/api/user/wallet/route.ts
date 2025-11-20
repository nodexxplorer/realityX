// app/api/user/wallet/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import pool from "@/lib/db";

// Save or update wallet
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { wallet } = await req.json();
  if (!wallet) {
    return NextResponse.json({ error: "Wallet not provided" }, { status: 400 });
  }

  try {
    await pool.query(
      "UPDATE profiles SET walletAddress = $1, updatedAt = NOW() WHERE id = $2",
      [wallet, session.user.id]
    );

    return NextResponse.json({ success: true, wallet });
  } catch (err) {
    console.error("Error saving wallet:", err);
    return NextResponse.json({ error: "Failed to save wallet" }, { status: 500 });
  }
}

// Fetch wallet
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pool.query(
      "SELECT walletAddress FROM profiles WHERE id = $1 LIMIT 1",
      [session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ wallet: null });
    }

    return NextResponse.json({ wallet: result.rows[0].walletAddress });
  } catch (err) {
    console.error("Error fetching wallet:", err);
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}
