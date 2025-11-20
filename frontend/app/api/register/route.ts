// app/api/register/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import pool from "@/lib/db";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { name, email, password, nickname } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // 1️⃣ Create Supabase user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, nickname } },
    });

    if (error) {
      console.error("Supabase signup error:", error);
      return NextResponse.json({ error: error.message ?? "Sign up failed" }, { status: 400 });
    }

    const supaUser = data.user;
    if (!supaUser) return NextResponse.json({ error: "No user returned" }, { status: 500 });

    const supaId = supaUser.id;

    // 2️⃣ Insert into auth_users with NUMERIC role (2 = user)
    const authUserResult = await pool.query(
      `
      INSERT INTO auth_users (supabase_id, email, name, nickname, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $5, NOW())
      ON CONFLICT (email) DO UPDATE
        SET name = COALESCE(EXCLUDED.name, auth_users.name),
            nickname = COALESCE(EXCLUDED.nickname, auth_users.nickname),
            updated_at = NOW()
      RETURNING id;
      `,
      [supaId, email, name ?? null, nickname ?? null, 2]  // ✅ role: 2 (user)
    );

    const authUserId = authUserResult.rows[0]?.id;
    if (!authUserId) throw new Error("Failed to get auth_users.id");

    // 3️⃣ Insert into profiles with NUMERIC role
    await pool.query(
      `
      INSERT INTO profiles
        (user_id, name, nickname, role, is_premium, verified, email_verified, created_at, updated_at, email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8)
      ON CONFLICT (user_id) DO UPDATE
        SET name = COALESCE(EXCLUDED.name, profiles.name),
            nickname = COALESCE(EXCLUDED.nickname, profiles.nickname),
            updated_at = NOW();
      `,
      [authUserId, name ?? null, nickname ?? null, 2, false, false, supaUser.confirmed_at ?? null, email]
      // ✅ user_role: 2 (not "user" text)
    );

    // 4️⃣ Insert subscription if missing
    const subCheck = await pool.query(`SELECT 1 FROM subscriptions WHERE user_id = $1 LIMIT 1`, [
      authUserId,
    ]);
    if (subCheck.rowCount === 0) {
      await pool.query(
        `
        INSERT INTO subscriptions
          (user_id, plan, status, credits, active, created_at, updated_at)
        VALUES ($1, 'free', 'active', 100, true, NOW(), NOW());
        `,
        [authUserId]
      );
    }

    return NextResponse.json(
      { success: true, user: { id: authUserId, email, name, nickname } },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Register route error:", err);
    return NextResponse.json({ error: err.message ?? "Unexpected error" }, { status: 500 });
  }
}

