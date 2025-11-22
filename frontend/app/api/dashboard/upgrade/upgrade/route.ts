// app/api/dashboard/upgrade/upgrade/route.ts - PROCESS UPGRADE

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

    const body = await req.json();
    const { plan, txSignature } = body;

    console.log(`💰 Processing upgrade request: plan=${plan}, tx=${txSignature?.substring(0, 20)}...`);

    if (!plan || !txSignature) {
      console.error("❌ Missing plan or txSignature");
      return NextResponse.json(
        { error: "Plan and transaction signature required" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    console.log(`📡 Sending upgrade request to: ${backendUrl}/upgrade/upgrade`);
    
    const response = await fetch(`${backendUrl}/upgrade/upgrade`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.user.email}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan, txSignature }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Backend upgrade error:", data);
      return NextResponse.json(
        { error: data.detail || data.error || "Failed to upgrade" },
        { status: response.status }
      );
    }

    console.log("✅ Upgrade successful:", data);

    return NextResponse.json(
      {
        success: true,
        plan: data.plan,
        expiry: data.expiry,
        is_premium: data.is_premium,
        message: data.message,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("❌ Error in /api/dashboard/upgrade/upgrade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
