// app/api/auth/verify/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/mailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key needed for updates
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Find profile with matching token
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("verification_token", token)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    // Update profile as verified
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        verified: true,
        verification_token: null,
        email_verified: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json({ error: "Failed to verify account" }, { status: 500 });
    }

    // Send welcome email
    await sendWelcomeEmail(profile.email, profile.name || profile.nickname || "User");

    return NextResponse.json({ success: true, message: "Account verified successfully" });
  } catch (err: any) {
    console.error("Verification error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}




