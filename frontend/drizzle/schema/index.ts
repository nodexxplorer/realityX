// drizzle/schema/index.ts
export * from "./authUsers";
export * from "./profiles";
export * from "./accounts";
export * from "./sessions";
export * from "./verificationTokens";
// if you keep subscriptions file
export * from "./subscriptions";  
export * from "./usageLogs";
export * from "./daoProposals";
export * from "./daoVotes";

import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin", "contributor", "viewer"]);
export const voteType = pgEnum("vote_type", ["yes", "no"]);
export const proposalStatus = pgEnum("proposal_status", ["open", "closed", "executed"]);
export const subscriptionStatus = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "expired",
]);
export const planEnum = pgEnum("plan_enum", ["free", "pro", "premium"]);

// // drizzle/schema/index.ts

// export * from "./authUsers";
// export * from "./profiles";
// export * from "./accounts";
// export * from "./sessions";
// export * from "./verificationTokens";
// export * from "./subscriptions";
// export * from "./usageLogs";
// export * from "./daoProposals";
// export * from "./daoVotes";

// // enums
// import { pgEnum } from "drizzle-orm/pg-core";

// export const userRole = pgEnum("user_role", ["user", "admin", "contributor", "viewer"]);
// export const voteType = pgEnum("vote_type", ["yes", "no"]);
// export const proposalStatus = pgEnum("proposal_status", ["open", "closed", "executed"]);
// export const subscriptionStatus = pgEnum("subscription_status", [
//   "trialing",
//   "active",
//   "past_due",
//   "canceled",
//   "expired",
// ]);
// export const planEnum = pgEnum("plan_enum", ["free", "pro", "premuim"]);




// DROP TABLE usage_logs CASCADE;
// DROP TABLE dao_proposals CASCADE;
// DROP TABLE profiles CASCADE;
// DROP TABLE sessions CASCADE;
// DROP TABLE subscriptions CASCADE;
// DROP TABLE dao_votes CASCADE;
// DROP TABLE verification_tokens CASCADE;
// DROP TABLE accounts CASCADE;
// DROP TABLE auth_users CASCADE;


