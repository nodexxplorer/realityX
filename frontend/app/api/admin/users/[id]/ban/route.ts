// app/api/admin/users/[id]/ban/route.ts

import { requireAdminAuth } from "@/lib/admin/auth-middleware";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof Response) return auth;

  try {
    const body = await req.json();
    const { reason } = body;

    // Update user status to banned
    const result = await pool.query(
      "UPDATE auth_users SET status = 'banned', updated_at = NOW() WHERE id = $1 RETURNING *",
      [params.id]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Log admin action
    await pool.query(
      "INSERT INTO admin_logs (admin_email, action, target_user_id, reason, created_at) VALUES ($1, $2, $3, $4, NOW())",
      [auth.email, 'ban_user', params.id, reason || null]
    );

    return NextResponse.json({ message: "User banned successfully" });
  } catch (error) {
    console.error("Ban user error:", error);
    return NextResponse.json(
      { error: "Failed to ban user" },
      { status: 500 }
    );
  }
}