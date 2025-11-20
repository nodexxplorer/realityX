// drizzle/schema/accounts.ts
import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { authUsers } from "./authUsers";

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull().references(() => authUsers.id),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  provider_account_id: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});






// export const accounts = pgTable(
//   "accounts",
//   {
//     authUserId: uuid("auth_user_id").notNull().references(() => authUsers.id),
//     type: text("type").notNull(),
//     provider: text("provider").notNull(),
//     providerAccountId: text("provider_account_id").notNull(),
//     access_token: text("access_token"),
//     expires_at: text("expires_at"),
//     token_type: text("token_type"),
//     scope: text("scope"),
//     id_token: text("id_token"),
//     session_state: text("session_state"),
//     refresh_token: text("refresh_token"),
//   },
//   (table) => ({
//     pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
//   })
// );


