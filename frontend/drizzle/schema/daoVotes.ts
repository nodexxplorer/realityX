// drizzle/schema/daoVotes.ts

import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { daoProposals } from "./daoProposals";
import { authUsers } from "./authUsers";

export const daoVotes = pgTable("dao_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  proposal_id: uuid("proposal_id").notNull().references(() => daoProposals.id),
  voter_id: uuid("voter_id").notNull().references(() => authUsers.id),
  vote: text("vote").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});



// // drizzle/schema/daoVotes.ts

// import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
// import { daoProposals } from "./daoProposals";
// import { authUsers } from "./authUsers";

// export const daoVotes = pgTable("dao_votes", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   proposal_id: uuid("proposal_id").notNull().references(() => daoProposals.id),
//   voter_email: text("email").notNull().unique(),
//   vote: text("vote").notNull(),
//   voted_at: timestamp("voted_at").defaultNow(),
// });
