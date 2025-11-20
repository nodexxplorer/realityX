// lib/increment-usage.ts

import { db } from "@/lib/drizzle";
import { usageLogs } from "@/drizzle/schema";
import { sql } from "drizzle-orm";


export async function incrementUsage(email: string) {
  const existing = await db.query.usage.findFirst({
    where: sql(usageLogs.userId, email),
  });

  if (existing) {
    await db
      .update(usageLogs)
      .set({ /* Replace 'creditsUsed' with the correct field name from your schema, e.g. 'usageCount' */
        creditsUsed: (existing.creditsUsed ?? 0) + 1
      })
      .where(sql(usageLogs.userId, email));
  } else {
    await db.insert(usageLogs).values({
      userId: email,
      // Replace 'creditsUsed' with the actual field name from your schema if different
      creditsUsed: 1,
    });
  }
}
