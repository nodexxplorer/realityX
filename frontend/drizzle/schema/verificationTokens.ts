// drizzle/schema/verificationTokens.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").primaryKey(),
  expires: timestamp("expires").notNull(),
});


// // drizzle/schema/verificationTokens.ts

// import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";

// export const verification_tokens = pgTable("verification_tokens", {
//   identifier: text("identifier").notNull(),
//   token: text("token").notNull(),
//   expires: timestamp("expires", { withTimezone: true }).notNull(),
//   id: text("id").primaryKey(), // optional composite key if needed
// });
