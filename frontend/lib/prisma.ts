// lib/prisma.ts

import { PrismaClient } from "@prisma/client";

declare global {
  // avoid hot-reload issues in Next.js
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
