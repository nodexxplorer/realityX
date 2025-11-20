// app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const type = params.get("type") || "metrics";

  let url = `${BACKEND}/api/analytics/metrics`;
  if (type === "top-users") {
    const limit = params.get("limit") || "10";
    url = `${BACKEND}/api/analytics/top-users?limit=${encodeURIComponent(limit)}`;
  } else if (type === "daily-usage") {
    const days = params.get("days") || "30";
    url = `${BACKEND}/api/analytics/daily-usage?days=${encodeURIComponent(days)}`;
  }

  const r = await fetch(url);
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
