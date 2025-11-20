// lib/roleCheck.ts

import { NextResponse } from "next/server";
import { auth } from "./auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }
  // role is numeric level: 4 = admin
  const role = typeof session.user.role === 'number' ? session.user.role : Number(session.user.role ?? 2);
  if (isNaN(role) || role < 4) {
    return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL));
  }
  return session;
}
