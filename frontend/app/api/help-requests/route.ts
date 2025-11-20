// app/api/user/help-requests/route.ts


import { auth } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { type, subject, message } = body;

    // Validate
    if (!type || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user info
    const userResult = await pool.query(
      "SELECT id, name FROM auth_users WHERE email = $1",
      [session.user.email]
    );

    if (!userResult.rows.length) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Create request
    const result = await pool.query(
      `INSERT INTO help_requests 
       (user_id, user_name, email, type, subject, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user.id, user.name, session.user.email, type, subject, message]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Submit help request error:", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const userResult = await pool.query(
      "SELECT id FROM auth_users WHERE email = $1",
      [session.user.email]
    );

    if (!userResult.rows.length) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;

    // Count total
    const countResult = await pool.query(
      "SELECT COUNT(*) as count FROM help_requests WHERE user_id = $1",
      [userId]
    );
    const total = parseInt(countResult.rows[0]?.count || "0");

    // Get requests
    const result = await pool.query(
      `SELECT * FROM help_requests 
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return NextResponse.json({
      data: result.rows,
      total,
      page,
      limit,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Get user help requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}