// app/api/admin/help-requests/route.ts


import { requireAdminAuth } from "@/lib/admin/auth-middleware";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function getPaginationParams(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
  return { page: Math.max(1, page), limit: Math.min(100, Math.max(1, limit)) };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof Response) return auth;

  try {
    const { page, limit } = getPaginationParams(req);
    const type = req.nextUrl.searchParams.get("type");
    const status = req.nextUrl.searchParams.get("status");
    const priority = req.nextUrl.searchParams.get("priority");
    const search = req.nextUrl.searchParams.get("search");

    let query = "SELECT * FROM help_requests WHERE 1=1";
    const params: any[] = [];
    let paramCount = 1;

    if (type) {
      query += ` AND type = $${paramCount++}`;
      params.push(type);
    }

    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    if (priority) {
      query += ` AND priority = $${paramCount++}`;
      params.push(priority);
    }

    if (search) {
      query += ` AND (subject ILIKE $${paramCount++} OR message ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      paramCount += 2;
    }

    // Count total
    const countResult = await pool.query(
      query.replace("SELECT *", "SELECT COUNT(*) as count"),
      params
    );
    const total = parseInt(countResult.rows[0]?.count || "0");

    // Paginate
    const offset = (page - 1) * limit;
    query += ` ORDER BY priority DESC, created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return NextResponse.json({
      data: result.rows,
      total,
      page,
      limit,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Get help requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}