// app/api/strategy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "";

// Role mapping for string roles -> numeric levels
const ROLE_MAP: Record<string, number> = {
  admin: 4,
  contributor: 3,
  user: 2,
  viewer: 1,
};

function normalizeRole(raw: any): number {
  if (typeof raw === 'number' && !isNaN(raw)) return raw;
  if (typeof raw === 'string') {
    const lower = raw.toLowerCase();
    if (ROLE_MAP[lower]) return ROLE_MAP[lower];
    const n = Number(raw);
    return isNaN(n) ? 2 : n;
  }
  return 2;
}

async function requireAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  if (!token) return { ok: false, status: 401, message: "Not authenticated" };
  const rawRole = (token as any).user?.role ?? (token as any).role ?? token?.role;
  const role = normalizeRole(rawRole);
  if (role < 4) return { ok: false, status: 403, message: "Admin only" };
  return { ok: true, token };
}

export async function POST(req: NextRequest) {
  const check = await requireAdmin(req);
  if (!check.ok) return NextResponse.json({ error: check.message }, { status: check.status });

  const body = await req.json();
  // forward to backend
  const url = `${BACKEND}/api/strategy/update`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  return NextResponse.json(data, { status: r.status });
}
