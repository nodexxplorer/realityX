// app/api/wallet/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  // expects query ?wallet=
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "wallet query required" }, { status: 400 });

  const url = `${BACKEND}/api/wallet/nonce?wallet=${encodeURIComponent(wallet)}`;
  const r = await fetch(url);
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}

export async function POST(req: NextRequest) {
  // verifies link: body contains { wallet, signature, nonce, email }
  const body = await req.json();
  const url = `${BACKEND}/api/wallet/verify-link`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
