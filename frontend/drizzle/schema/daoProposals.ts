// drizzle/schema/daoProposals.ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { authUsers } from "./authUsers";

export const daoProposals = pgTable("dao_proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  creator_id: uuid("creator_id").notNull().references(() => authUsers.id),
  status: text("status").default("open"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});



// // drizzle/schema/daoProposals.ts

// import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
// import { authUsers } from "./authUsers";

// export const daoProposals = pgTable("dao_proposals", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   creator_email: text("email").notNull().unique(),
//   title: text("title").notNull(),
//   description: text("description").notNull(),
//   status: text("status").default("active"),
//   created_at: timestamp("created_at").defaultNow(),
//   ends_at: timestamp("ends_at"),
// });
