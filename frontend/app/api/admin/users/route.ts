// app/api/admin/users/route.ts

import { requireAdminAuth } from "@/lib/admin/auth-middleware";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface PaginationParams {
  page: number;
  limit: number;
}

function getPaginationParams(req: NextRequest): PaginationParams {
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
  return { page: Math.max(1, page), limit: Math.min(100, Math.max(1, limit)) };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof Response) return auth;

  try {
    const { page, limit } = getPaginationParams(req);
    const role = req.nextUrl.searchParams.get("role");
    const status = req.nextUrl.searchParams.get("status");
    const search = req.nextUrl.searchParams.get("search");

    let query = "SELECT * FROM auth_users WHERE 1=1";
    const params: any[] = [];
    let paramCount = 1;

    // Filters
    if (role && role !== "All") {
      // Convert role string to number: "Admin" -> 4, "User" -> 2
      const roleNum = role === "Admin" ? 4 : role === "User" ? 2 : null;
      if (roleNum !== null) {
        query += ` AND user_role = $${paramCount++}`;
        params.push(roleNum);
      }
    }

    if (status && status !== "All") {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    if (search && search.trim()) {
      query += ` AND (email ILIKE $${paramCount++} OR name ILIKE $${paramCount++})`;
      params.push(`%${search.trim()}%`);
      params.push(`%${search.trim()}%`);
    }

    // Get total count
    const countResult = await pool.query(
      query.replace("SELECT *", "SELECT COUNT(*) as count"),
      params
    );
    const total = parseInt(countResult.rows[0]?.count || "0");

    // Paginate
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return NextResponse.json({
      data: result.rows.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.user_role === 4 ? 'Admin' : 'User',
        is_premium: user.is_premium || false,
        status: user.status || 'active',
        lastActive: user.last_login || user.created_at,
        createdAt: user.created_at,
      })),
      total,
      page,
      limit,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}