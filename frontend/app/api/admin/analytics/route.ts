// app/api/admin/analytics/route.ts

import { requireAdminAuth } from "@/lib/admin/auth-middleware";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof Response) return auth;

  try {
    // Default to last 30 days instead of 7 for better data coverage
    // Use UTC dates to avoid timezone issues
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const startDate = req.nextUrl.searchParams.get("startDate") || 
      thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = req.nextUrl.searchParams.get("endDate") || 
      now.toISOString().split('T')[0];

    // Use conversations table (as per migrations)
    const result = await pool.query(
      `
      SELECT 
        DATE(created_at)::text as date,
        COUNT(DISTINCT id) as usage,
        0 as tokens,
        0 as errors,
        COUNT(DISTINCT user_id) as users
      FROM conversations
      WHERE created_at >= $1::timestamp 
        AND created_at <= $2::timestamp + INTERVAL '1 day'
        AND created_at <= NOW() -- Exclude future dates
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
      `,
      [startDate, endDate]
    );

    // Format dates properly and filter out any future dates
    const today = new Date().toISOString().split('T')[0];
    const data = result.rows
      .filter(row => row.date <= today) // Additional safeguard
      .map(row => ({
        date: row.date,
        usage: parseInt(row.usage || "0"),
        tokens: parseInt(row.tokens || "0"),
        errors: parseInt(row.errors || "0"),
        users: parseInt(row.users || "0"),
      }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}