// app/api/admin/users/[id]/route.ts)

import { requireAdminAuth } from "@/lib/admin/auth-middleware";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof Response) return auth;

  try {
    // params.id will be the UUID from the URL
    console.log("Fetching user with ID:", params.id);

    const result = await pool.query(
      "SELECT * FROM auth_users WHERE id = $1 LIMIT 1",
      [params.id]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.user_role === 4 ? 'Admin' : 'User',
      is_premium: user.is_premium || false,
      status: user.status || 'active',
      lastActive: user.last_login || user.created_at,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof Response) return auth;

  try {
    const body = await req.json();
    const { name, email, status } = body;

    const result = await pool.query(
      "UPDATE auth_users SET name = COALESCE($1, name), email = COALESCE($2, email), status = COALESCE($3, status) WHERE id = $4 RETURNING *",
      [name || null, email || null, status || null, params.id]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof Response) return auth;

  try {
    const result = await pool.query(
      "DELETE FROM auth_users WHERE id = $1 RETURNING id",
      [params.id]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
