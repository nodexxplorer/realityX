// app/api/dashboard/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for read/write
);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "id, name, nickname, email, wallet_address, is_premium, plan, plan_expiry"
      )
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = {
      ...profile,
      is_premium: (profile as any).is_premium ?? false,
    };

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("Dashboard fetch exception:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
