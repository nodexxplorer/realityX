// lib/permissions.ts

import { Session } from "next-auth";

export function isAdmin(session: Session | null): boolean {
  // role is stored as a numeric level: 4 = admin
  const role = (session?.user?.role ?? 2) as number;
  return typeof role === 'number' ? role >= 4 : false;
}
