// drizzle/schema/usageLogs.ts
import { pgTable, uuid, integer, timestamp, text } from "drizzle-orm/pg-core";
import { authUsers } from "./authUsers";

export const usageLogs = pgTable("usage_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => authUsers.id),
  count: integer("count").default(0),
  last_used: timestamp("last_used").defaultNow(),
  note: text("note"),
});



// // drizzle/schema/usageLogs.ts

// import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
// import { authUsers } from "./authUsers";

// export const usageLogs = pgTable("usage_logs", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   email: text("email").notNull().unique(),
//   action: text("action").notNull(),
//   credits_used: integer("credits_used").default(0),
//   timestamp: timestamp("timestamp").defaultNow(),
// });
