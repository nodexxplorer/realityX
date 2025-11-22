// app/api/dashboard/upgrade/cancel/route.ts - CANCEL SUBSCRIPTION

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.error("❌ Unauthorized: No session");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    console.log(`🛑 Cancelling subscription via: ${backendUrl}/upgrade/cancel`);
    
    const response = await fetch(`${backendUrl}/upgrade/cancel`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.user.email}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Backend cancel error:", data);
      return NextResponse.json(
        { error: data.detail || "Failed to cancel subscription" },
        { status: response.status }
      );
    }

    console.log("✅ Subscription cancelled:", data);

    return NextResponse.json(
      {
        success: true,
        message: data.message,
        plan: "free",
        is_premium: false,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("❌ Error in /api/dashboard/upgrade/cancel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}