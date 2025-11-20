// drizzle/schema/subscriptions.ts
import { pgTable, uuid, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { authUsers } from "./authUsers";

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => authUsers.id),
  plan: text("plan").default("free"),
  status: text("status").default("active"),
  credits: integer("credits").default(100),
  active: boolean("active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

