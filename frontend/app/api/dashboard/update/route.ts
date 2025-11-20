// app/api/dashboard/update/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for updates
);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, nickname, email } = await req.json();

    if (!name && !nickname && !email) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    // Update only the fields that are provided
    const updates: Record<string, any> = {};
    if (name) updates.name = name;
    if (nickname) updates.nickname = nickname;
    if (email) updates.email = email;

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", session.user.id);

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (err: any) {
    console.error("Update profile error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
