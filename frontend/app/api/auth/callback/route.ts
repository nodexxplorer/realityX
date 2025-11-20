// // app/api/auth/callback/route.ts

// import { NextResponse } from "next/server";
// import pool from "@/lib/db";

// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const email = url.searchParams.get("email");
//     if (!email) return NextResponse.json({ error: "Email missing" }, { status: 400 });

//     // Update local DB verification flags
//     await pool.query(
//       `UPDATE auth_users SET verified = true, email_verified = NOW() WHERE email = $1`,
//       [email]
//     );

//     await pool.query(
//       `UPDATE profiles SET verified = true, email_verified = NOW() WHERE email = $1`,
//       [email]
//     );

//     return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
//   } catch (err: any) {
//     console.error("Callback error:", err);
//     return NextResponse.json({ error: err.message ?? "Unexpected error" }, { status: 500 });
//   }
// }

// import { NextResponse } from "next/server";
// import pool from "@/lib/db";

// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const access_token = url.searchParams.get("access_token"); // Supabase sends this
//     const email = url.searchParams.get("email");

//     if (!email) return NextResponse.json({ error: "Email not found" }, { status: 400 });

//     // Update local auth_users and profiles
//     await pool.query(
//       `UPDATE auth_users SET email_verified = NOW() WHERE email = $1`,
//       [email]
//     );

//     await pool.query(
//       `UPDATE profiles SET verified = true, email_verified = NOW() WHERE email = $1`,
//       [email]
//     );

//     // Redirect user to login page
//     return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
//   } catch (err: any) {
//     console.error("Callback error:", err);
//     return NextResponse.json({ error: err.message ?? "Unexpected error" }, { status: 500 });
//   }
// }
