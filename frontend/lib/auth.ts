// lib/auth.ts

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/routes"; // make sure this points to your authOptions

export async function auth() {
  const session = await getServerSession(authOptions);
  return session; // can type as Promise<Session | null> if needed
}
