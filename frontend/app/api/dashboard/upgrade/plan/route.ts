// app/api/dashboard/upgrade/plan/route.ts - GET CURRENT PLAN

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
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
    
    console.log(`📡 Fetching plan from backend: ${backendUrl}/upgrade/plan`);
    
    const response = await fetch(`${backendUrl}/upgrade/plan`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.user.email}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Backend error:", data);
      return NextResponse.json(
        { plan: "free", expiry: null, is_premium: false },
        { status: 200 }
      );
    }

    console.log("✅ Plan fetched:", data);
    
    return NextResponse.json(data, { status: 200 });
    
  } catch (error) {
    console.error("❌ Error in /api/dashboard/upgrade/plan:", error);
    return NextResponse.json(
      { plan: "free", expiry: null, is_premium: false },
      { status: 200 }
    );
  }
}
