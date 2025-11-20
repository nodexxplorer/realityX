// app/api/admin/dashboard/route.ts

import { requireAdminAuth } from "@/lib/admin/auth-middleware";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    // Total users
    const usersResult = await pool.query(
      "SELECT COUNT(*) as count FROM auth_users WHERE active = true"
    );
    const totalUsers = parseInt(usersResult.rows[0]?.count || "0");

    // Active users today
    const activeResult = await pool.query(
      "SELECT COUNT(DISTINCT user_id) as count FROM messages WHERE DATE(created_at) = CURRENT_DATE"
    );
    const activeToday = parseInt(activeResult.rows[0]?.count || "0");

    // Premium users
    const premiumResult = await pool.query(
      "SELECT COUNT(*) as count FROM auth_users WHERE is_premium = true"
    );
    const premiumUsers = parseInt(premiumResult.rows[0]?.count || "0");

    // Total conversations
    const convoResult = await pool.query(
      "SELECT COUNT(*) as count FROM conversations"
    );
    const totalConversations = parseInt(convoResult.rows[0]?.count || "0");

    // Total messages
    const msgsResult = await pool.query(
      "SELECT COUNT(*) as count FROM messages"
    );
    const totalMessages = parseInt(msgsResult.rows[0]?.count || "0");

    // Messages today
    const msgsTodayResult = await pool.query(
      "SELECT COUNT(*) as count FROM messages WHERE DATE(created_at) = CURRENT_DATE"
    );
    const messagesToday = parseInt(msgsTodayResult.rows[0]?.count || "0");

    // Growth calculation
    const thisMonthResult = await pool.query(
      "SELECT COUNT(*) as count FROM auth_users WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
    );
    const thisMonthUsers = parseInt(thisMonthResult.rows[0]?.count || "0");

    const lastMonthResult = await pool.query(
      "SELECT COUNT(*) as count FROM auth_users WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')"
    );
    const lastMonthUsers = parseInt(lastMonthResult.rows[0]?.count || "0");

    const growth =
      lastMonthUsers > 0
        ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100
        : thisMonthUsers > 0
          ? 100
          : 0;

    return NextResponse.json({
      users: {
        total: totalUsers,
        active_today: activeToday,
        premium: premiumUsers,
        growth: parseFloat(growth.toFixed(1)),
      },
      conversations: {
        total: totalConversations,
      },
      messages: {
        total: totalMessages,
        today: messagesToday,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}