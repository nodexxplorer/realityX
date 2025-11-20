// pages/api/auth/nextauth.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import pool from "@/lib/db"; // adjust path if needed
// import { users, usageLogs } from "@/drizzle/schema";
// import { pool } from "drizzle-orm";

// Alias pool as db for compatibility
const db = pool;

// Role mapping: string role -> numeric level
const ROLE_MAP: Record<string, number> = {
  admin: 4,
  contributor: 3,
  user: 2,
  viewer: 1,
};

function normalizeRole(raw: any): number {
  if (typeof raw === "number" && !isNaN(raw)) return raw;
  if (typeof raw === "string") {
    const lower = raw.toLowerCase();
    if (ROLE_MAP[lower]) return ROLE_MAP[lower];
    const n = Number(raw);
    return isNaN(n) ? 2 : n;
  }
  return 2;
}

// DB fetch helper
async function findUserByEmail(email: string) {
  // Adjust this query according to your ORM or query builder
  const result = await db.query(
    `SELECT * FROM authusers WHERE email = $1 LIMIT 1`,
    [email]
  );
  return result.rows?.[0] ?? null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    // 🔐 CREDENTIALS LOGIN
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};

        if (!email) return null;
        const user = await findUserByEmail(email);
        if (!user || !user.password) return null;

        if (typeof password !== "string" || typeof user.password !== "string") return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          is_premium: user.is_premium,
          // normalize role (handle numeric or string role values)
          role: normalizeRole((user as any).role ?? 2),
        };
      },
    }),

    // 🟢 GOOGLE LOGIN
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // 🔄 Handle Google or other providers
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await findUserByEmail(user.email!);

        if (!existingUser) {
          await db.query(
            `INSERT INTO authusers (email, name, image, is_premium, credits) VALUES ($1, $2, $3, $4, $5)`,
            [
              user.email!,
              user.name ?? "Unnamed",
              user.image ?? "",
              false,
              4, // default for new users
            ]
          );
        }
      }
      return true;
    },

    // ✅ JWT TOKEN
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.is_premium = (user as any).is_premium ?? false;
        // normalize and preserve numeric role in token
        const userRoleRaw = (user as any).role ?? (token as any).role ?? 2;
        (token as any).role = normalizeRole(userRoleRaw);
      }

      // also normalize existing token.role if present
      if ((token as any).role && typeof (token as any).role !== 'number') {
        (token as any).role = normalizeRole((token as any).role);
      }

      return token;
    },

    // ✅ SESSION OBJECT
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.is_premium = token.is_premium as boolean;
        // attach numeric role to session.user.role (normalize just in case)
        session.user.role = normalizeRole((token as any).role ?? 2);
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET!,
};

export default NextAuth(authOptions);
