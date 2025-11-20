CREATE TYPE "public"."plan_enum" AS ENUM('free', 'pro', 'premuim');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('open', 'closed', 'executed');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'canceled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'contributor', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."vote_type" AS ENUM('yes', 'no');--> statement-breakpoint
CREATE TABLE "auth_users" (
	"email" text PRIMARY KEY NOT NULL,
	"name" text,
	"nickname" text,
	"email_verified" timestamp with time zone,
	"verified" boolean DEFAULT false,
	"image" text,
	"wallet_address" text,
	"is_premium" boolean DEFAULT false,
	"user_role" text DEFAULT 'user',
	"active" boolean DEFAULT true,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'user',
	"credits" integer DEFAULT 0,
	"subscription_id" uuid,
	"nickname" text,
	"verified" boolean DEFAULT false,
	"email_verified" timestamp,
	"wallet_address" text,
	"user_role" text DEFAULT 'user',
	"is_premium" boolean DEFAULT false,
	"active" boolean DEFAULT true,
	"deleted_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	"name" text
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"email" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"access_token" text,
	"expires_at" text,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	"refresh_token" text,
	"provider_id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"email" text,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"plan" text NOT NULL,
	"status" text DEFAULT 'active',
	"credits" integer DEFAULT 100,
	"renew_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"expired_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"profile_id" uuid,
	"active" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"action" text NOT NULL,
	"credits_used" integer DEFAULT 0,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dao_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_email" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"ends_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "dao_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"voter_email" text NOT NULL,
	"vote" text NOT NULL,
	"voted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_email_auth_users_email_fk" FOREIGN KEY ("email") REFERENCES "public"."auth_users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_email_auth_users_email_fk" FOREIGN KEY ("email") REFERENCES "public"."auth_users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_email_auth_users_email_fk" FOREIGN KEY ("email") REFERENCES "public"."auth_users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_email_auth_users_email_fk" FOREIGN KEY ("email") REFERENCES "public"."auth_users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_email_auth_users_email_fk" FOREIGN KEY ("email") REFERENCES "public"."auth_users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dao_proposals" ADD CONSTRAINT "dao_proposals_creator_email_auth_users_email_fk" FOREIGN KEY ("creator_email") REFERENCES "public"."auth_users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dao_votes" ADD CONSTRAINT "dao_votes_proposal_id_dao_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."dao_proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dao_votes" ADD CONSTRAINT "dao_votes_voter_email_auth_users_email_fk" FOREIGN KEY ("voter_email") REFERENCES "public"."auth_users"("email") ON DELETE no action ON UPDATE no action;