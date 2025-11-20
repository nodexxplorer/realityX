// app/api/admin/users/[id]/promote/route.ts

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
    // Update user role to admin (4)
    const result = await pool.query(
      "UPDATE auth_users SET user_role = 4, updated_at = NOW() WHERE id = $1 RETURNING *",
      [params.id]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Log admin action
    await pool.query(
      "INSERT INTO admin_logs (admin_email, action, target_user_id, created_at) VALUES ($1, $2, $3, NOW())",
      [auth.email, 'promote_user', params.id]
    );

    return NextResponse.json({ message: "User promoted to admin successfully" });
  } catch (error) {
    console.error("Promote user error:", error);
    return NextResponse.json(
      { error: "Failed to promote user" },
      { status: 500 }
    );
  }
}