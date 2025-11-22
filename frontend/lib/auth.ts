// lib/auth.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // correct filename is 'route' (singular) for Next.js App Router

export async function auth() {
  const session = await getServerSession(authOptions);
  return session; // can type as Promise<Session | null> if needed
}
