// lib/session.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

// This is a helper to fetch the typed session on the server
export async function getSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}
