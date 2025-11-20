// // lib/usage.ts

// // import { db, usageLogs } from "@/lib/db";
// // import { and, eq, sql } from "drizzle-orm";

// // export async function checkMonthlyUsageAllowed(userId: number) {
// //   const now = new Date();
// //   const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

// //   const result = await db
// //     .select({ count: sql<number>`count(*)` })
// //     .from(usageLogs)
// //     .where(and(eq(usageLogs.userId, userId), sql`created_at >= ${startOfMonth}`));

// //   const count = result[0]?.count ?? 0;

// //   return count < 4; // 4 free uses per calendar month
// // }


// // lib/usage.ts

// import { db } from "@/lib/db";
// import { usage } from "@/db not using again/schema";
// import { eq } from "drizzle-orm";
// import { endOfDay, startOfDay } from "date-fns";

// // Allow 4 free messages per day if not premium
// export async function isUsageAllowed(userId: string, is_premium: boolean) {
//   if (is_premium) return true;

//   const today = new Date();
//   const start = startOfDay(today);
//   const end = endOfDay(today);

//   const usageCount = await db
//     .select()
//     .from(usage)
//     .where(
//       eq(usage.userId, userId)
//     )
//     .then(records =>
//       records.filter(
//         (r) => r.type === "ai_chat" &&
//                r.createdAt &&
//                new Date(r.createdAt) >= start &&
//                new Date(r.createdAt) <= end
//       ).length
//     );

//   return usageCount < 4;
// }

// export async function logUsage(userId: string, type: string) {
//   await db.insert(usage).values({
//     userId,
//     type,
//     createdAt: new Date(),
//   });
// }
