// app/api/dashboard/Settings/update/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key for updates
);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, nickname, email } = await req.json();

    if (!name && !nickname && !email) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name: name ?? undefined,
        nickname: nickname ?? undefined,
        email: email ?? undefined,
      })
      .eq("id", session.user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Profile updated!" });
  } catch (err: any) {
    console.error("Update error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
