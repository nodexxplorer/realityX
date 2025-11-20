// app/api/subscription/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  // GET /api/subscription?user_email=...
  const userEmail = req.nextUrl.searchParams.get("user_email");
  if (!userEmail) return NextResponse.json({ error: "user_email required" }, { status: 400 });

  const url = `${BACKEND}/api/subscription/status?user_email=${encodeURIComponent(userEmail)}`;
  const r = await fetch(url);
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}

export async function POST(req: NextRequest) {
  // forward verify-payment: expects { signature, wallet, user_email }
  const body = await req.json();
  const url = `${BACKEND}/api/subscription/verify-payment`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
