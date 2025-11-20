// lib/admin/auth-middleware.ts

import { auth } from "@/lib/auth";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export interface AdminSession {
  email: string;
  role: number;
  isAdmin: boolean;
}

export async function requireAdminAuth(): Promise<AdminSession | NextResponse> {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const result = await pool.query(
      `SELECT user_role FROM auth_users WHERE email = $1 LIMIT 1`,
      [session.user.email]
    );

    const role = result.rows?.[0]?.user_role ?? 2;

    // role < 4 = not admin
    if (role < 4) {
      return NextResponse.json(
        { error: "Forbidden — Admin only" },
        { status: 403 }
      );
    }

    return {
      email: session.user.email,
      role,
      isAdmin: true,
    };
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}