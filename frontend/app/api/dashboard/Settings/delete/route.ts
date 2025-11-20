// app/api/dashboard/Settings/delete/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for deletes
);

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profileId = session.user.id;

    // Delete usage logs first (if any)
    const { error: usageError } = await supabase
      .from("usage_logs")
      .delete()
      .eq("user_id", profileId);

    if (usageError) {
      console.error("Usage logs delete error:", usageError);
    }

    // Delete subscriptions
    const { error: subsError } = await supabase
      .from("subscriptions")
      .delete()
      .eq("profile_id", profileId);

    if (subsError) {
      console.error("Subscriptions delete error:", subsError);
    }

    // Finally, delete the profile
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", profileId);

    if (profileError) {
      console.error("Profile delete error:", profileError);
      return NextResponse.json(
        { error: "Failed to delete profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account and all associated data deleted successfully",
    });
  } catch (err: any) {
    console.error("Delete account error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
