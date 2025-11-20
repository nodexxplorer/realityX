// app/api/webhook/supabase/route.ts

import { NextResponse } from "next/server";
import pool from "@/lib/db"; // use your postgres pool

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("🔔 Supabase webhook triggered:", payload);

    // Supabase sends new user info here
    const record = payload.record;

    if (!record || !record.email) {
      return NextResponse.json({ message: "No record or email provided" }, { status: 400 });
    }

    const email = record.email;
    const name = record.name || record.user_metadata?.name || null;
    const nickname = record.nickname || null;

    // 🟢 Insert user into auth_users
    await pool.query(
      `INSERT INTO auth_users (email, name, nickname, role, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (email) DO NOTHING;`,
      [email, name, nickname]
    );

    // 🟢 Create profile (linked by email)
    await pool.query(
      `INSERT INTO profiles (email, name, nickname, role, is_premium, verified, created_at, updated_at)
       VALUES ($1, $2, $3, 'user', false, false, NOW(), NOW())
       ON CONFLICT (email) DO NOTHING;`,
      [email, name, nickname]
    );

    // 🟢 Default subscription
    await pool.query(
      `INSERT INTO subscriptions (user_id, plan, status, credits, active, created_at)
       VALUES ($1, 'free', 'active', 100, true, NOW())
       ON CONFLICT DO NOTHING;`,
      [email]
    );

    return NextResponse.json({ success: true, message: "Webhook handled successfully" });
  } catch (err: any) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}



// import { NextResponse } from "next/server";
// import pool from "@/lib/db";

// export async function POST(req: Request) {
//   try {
//     const payload = await req.json();

//     // Verify it’s from Supabase (optional: use signature validation here)
//     const { type, record } = payload;

//     // We only care about "user.updated" events
//     if (type === "user.updated" && record?.email) {
//       const { id, email, email_confirmed_at } = record;

//       // ✅ Update the verified state in your Postgres DB
//       await pool.query(
//         `
//         UPDATE profiles
//         SET verified = $1, email_verified = $2, updated_at = NOW()
//         WHERE auth_user_id = $3 OR email = $4
//         `,
//         [!!email_confirmed_at, email_confirmed_at, id, email]
//       );

//       console.log(`✅ Synced verified status for ${email}`);
//     }

//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     console.error("Supabase webhook error:", err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
