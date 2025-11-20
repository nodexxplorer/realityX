// drizzle/schema/profiles.ts
import { pgTable, uuid, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { authUsers } from "./authUsers";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => authUsers.id),
  name: text("name"),
  nickname: text("nickname"),
  wallet_address: text("wallet_address"),
  user_role: text("user_role").default("user"),
  is_premium: boolean("is_premium").default(false),
  usage_limit: integer("usage_limit").default(4),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});






// import { pgTable, text, boolean, timestamp, integer, uuid } from "drizzle-orm/pg-core";
// import { authUsers } from "./authUsers";

// export const profiles = pgTable("profiles", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   email: text("email").notNull().references(() => authUsers.email),
//   role: text("role").default("user"),
//   credits: integer("credits").default(0),
//   subscription_id: uuid("subscription_id"),
//   nickname: text("nickname"),
//   verified: boolean("verified").default(false),
//   email_verified: timestamp("email_verified"),
//   wallet_address: text("wallet_address"),
//   user_role: text("user_role").default("user"),
//   is_premium: boolean("is_premium").default(false),
//   active: boolean("active").default(true),
//   created_at: timestamp("created_at").defaultNow(),
//   deleted_at: timestamp("deleted_at"),
//   updated_at: timestamp("updated_at").defaultNow(),
//   name: text("name"),
// });


