// lib/types.ts

import {
  InferModel,
  InferSelectModel,
  InferInsertModel,
} from "drizzle-orm";
import {
  profiles,
  usageLogs,
  daoProposals,
  daoVotes,
} from "@/drizzle/schema";

type User = InferSelectModel<typeof profiles>;
type NewUser = InferInsertModel<typeof profiles>;
type UsageLog = InferSelectModel<typeof usageLogs>;
type NewUsageLog = InferInsertModel<typeof usageLogs>;
type Proposal = InferSelectModel<typeof daoProposals>;
type NewProposal = InferInsertModel<typeof daoProposals>;
type Vote = InferSelectModel<typeof daoVotes>;
type NewVote = InferInsertModel<typeof daoVotes>;

export type {
  User,
  NewUser,
  UsageLog,
  NewUsageLog,
  Proposal,
  NewProposal,
  Vote,
  NewVote,
};



// /* User types */
// export type User         = InferSelectModel<typeof users>;
// export type NewUser      = InferInsertModel<typeof users>;

// /* Usage logs */
// export type UsageLog     = InferSelectModel<typeof usageLogs>;
// export type NewUsageLog  = InferInsertModel<typeof usageLogs>;

// /* DAO proposals */
// export type Proposal     = InferSelectModel<typeof daoProposals>;
// export type NewProposal  = InferInsertModel<typeof daoProposals>;

// /* DAO votes */
// export type Vote         = InferSelectModel<typeof daoVotes>;
// export type NewVote      = InferInsertModel<typeof daoVotes>;
