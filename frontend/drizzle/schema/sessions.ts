// drizzle/schema/sessions.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { authUsers } from "./authUsers";

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  session_token: text("session_token").notNull().unique(),
  user_id: text("user_id").notNull().references(() => authUsers.id),
  expires: timestamp("expires").notNull(),
});


// // drizzle/schema/sessions.ts

// import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
// import { authUsers } from "./authUsers";

// export const sessions = pgTable("sessions", {
//   session_token: text("session_token").primaryKey(),
//   email: text("email").notNull().unique(),
//   expires: timestamp("expires", { withTimezone: true }).notNull(),
// });

