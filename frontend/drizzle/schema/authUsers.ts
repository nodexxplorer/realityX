// drizzle/schema/authUsers.ts
import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

export const authUsers = pgTable("auth_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  supabase_id: uuid("supabase_id"),
  email: text("email").notNull().unique(),
  name: text("name"),
  nickname: text("nickname"),
  email_verified: timestamp("email_verified"),
  verified: boolean("verified").default(false),
  image: text("image"),
  wallet_address: text("wallet_address"),
  is_premium: boolean("is_premium").default(false),
  user_role: text("user_role").default("user"),
  active: boolean("active").default(true),
  deleted_at: timestamp("deleted_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});









