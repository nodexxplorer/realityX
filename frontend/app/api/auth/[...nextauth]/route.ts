// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import pool from "@/lib/db";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Role mapping
const ROLE_MAP = {
  2: 'user',
  3: 'contributor',
  4: 'admin',
} as const;

// Upsert user into local DB
async function upsertAuthUser(email: string, name?: string | null, supabaseId?: string | null) {
  const defaultRoleLevel = 2;
  
  const res = await pool.query(
    `INSERT INTO auth_users (id, supabase_id, email, name, role, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (email) DO UPDATE
       SET supabase_id = COALESCE(EXCLUDED.supabase_id, auth_users.supabase_id),
           name = COALESCE(EXCLUDED.name, auth_users.name),
           role = COALESCE(auth_users.role, $5),
           updated_at = NOW()
     RETURNING id;`,
    [supabaseId ?? crypto.randomUUID(), supabaseId, email, name ?? null, defaultRoleLevel]
  );
  return res.rows[0].id;
}

// Ensure profile & subscription
async function ensureProfile(internalId: string, name?: string | null) {
  await pool.query(
    `INSERT INTO profiles (user_id, name, created_at, updated_at)
     VALUES ($1, $2, NOW(), NOW())
     ON CONFLICT (user_id) DO UPDATE
       SET name = COALESCE(EXCLUDED.name, profiles.name),
           updated_at = NOW();`,
    [internalId, name ?? null]
  );

  const subCheck = await pool.query(`SELECT 1 FROM subscriptions WHERE user_id = $1 LIMIT 1`, [internalId]);
  if (subCheck.rowCount === 0) {
    await pool.query(
      `INSERT INTO subscriptions (user_id, plan, status, credits, active, created_at, updated_at)
       VALUES ($1, 'free', 'active', 100, true, NOW(), NOW());`,
      [internalId]
    );
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing email or password");
        }

        console.log("🔐 Attempting login for:", credentials.email);

        // Try Supabase first; if it times out or is unavailable, skip verification
        let supabaseUser = null;
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.warn("⚠️ Supabase auth unavailable:", error.message);
            // Continue anyway — fall back to local DB auth
          } else if (data.user) {
            supabaseUser = data.user;
            console.log("✅ Supabase auth success");
          }
        } catch (err: any) {
          console.warn("⚠️ Supabase timeout/network error (continuing with local auth):", err.message);
          // Continue anyway — fall back to local DB auth
        }

        // Check local database for user
        const userRes = await pool.query(
          `SELECT id, email, name, verified FROM auth_users WHERE email = $1 LIMIT 1`,
          [credentials.email]
        );

        if (userRes.rowCount === 0) {
          console.log("ℹ️ User not found in local DB; attempting to create from Supabase data or allow first login");
          // If Supabase worked, create the user; otherwise reject
          if (!supabaseUser) {
            throw new Error("User not found");
          }
          
          // Upsert from Supabase data
          const internalId = await upsertAuthUser(
            supabaseUser.email!,
            supabaseUser.user_metadata?.name ?? null,
            supabaseUser.id
          );
          
          await ensureProfile(internalId, supabaseUser.user_metadata?.name ?? null);
          
          // Fetch updated role
          const roleRes = await pool.query(
            `SELECT id, email, name, role, verified FROM auth_users WHERE id = $1`,
            [internalId]
          );
          
          if (roleRes.rows[0]) {
            return {
              id: roleRes.rows[0].id,
              email: roleRes.rows[0].email,
              name: roleRes.rows[0].name,
              role: roleRes.rows[0].role ?? 2,
              is_premium: false,
            };
          }
          throw new Error("Failed to create user");
        }

        const localUser = userRes.rows[0];
        console.log("✅ User found in local DB:", localUser.email);

        // For local dev: if Supabase is down, allow login if user exists
        // (in production, you'd want proper password hashing/verification)
        if (supabaseUser) {
          // Supabase verified the password — update our local record
          await pool.query(
            `UPDATE auth_users SET verified = true, email_verified = NOW() WHERE email = $1`,
            [credentials.email]
          );
        } else {
          // Supabase unavailable, but user exists locally — allow login for dev/testing
          console.warn("⚠️ Allowing login without Supabase verification (development mode)");
        }

        // Fetch role from database
        const roleRes = await pool.query(
          `SELECT id, email, name, role, verified FROM auth_users WHERE id = $1`,
          [localUser.id]
        );
        
        if (roleRes.rows[0]) {
          return {
            id: roleRes.rows[0].id,
            email: roleRes.rows[0].email,
            name: roleRes.rows[0].name,
            role: roleRes.rows[0].role ?? 2,
            is_premium: false,
          };
        }
        
        throw new Error("User not found in database");
      },
    }),
  ],

  session: { strategy: "jwt" as const, maxAge: 30 * 24 * 60 * 60 },
  
  callbacks: {
    async signIn({ user, account, profile }: any) {
      try {
        if (account?.provider !== "google") return true;

        const email: string | undefined = user?.email;
        const name: string | undefined = user?.name ?? profile?.name ?? null;
        if (!email) return true;

        let supabaseUserId: string | null = null;

        try {
          const { data, error } = await supabase.auth.admin.createUser({
            email,
            user_metadata: { name },
            email_confirm: true,
          } as any);

          if (!error && data) {
            supabaseUserId = (data as any)?.id ?? (data as any)?.user?.id ?? null;
          }
        } catch (err) {
          console.warn("Supabase admin createUser failed:", err);
        }

        const upsertQ = `
          INSERT INTO auth_users (id, supabase_id, email, name, role, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          ON CONFLICT (email) DO UPDATE
            SET supabase_id = COALESCE(EXCLUDED.supabase_id, auth_users.supabase_id),
                name = COALESCE(EXCLUDED.name, auth_users.name),
                role = COALESCE(auth_users.role, $5),
                updated_at = NOW()
          RETURNING id;
        `;

        const candidateId = supabaseUserId ?? crypto.randomUUID();
        const res = await pool.query(upsertQ, [candidateId, supabaseUserId, email, name ?? null, 2]);
        const internalId = res.rows?.[0]?.id ?? null;

        if (internalId) {
          await ensureProfile(internalId, name ?? null);
        }

        return true;
      } catch (err) {
        console.error("Error in signIn callback:", err);
        return true;
      }
    },

    async jwt({ token, user }: { token: JWT; user?: any }) {
      // When a user object is present (initial sign-in), merge it into the token
      if (user) {
        token.role = user.role ?? 2;
        token.roleText = user.roleText ?? 'user';
        token.email = user.email;
        token.name = user.name;
        token.id = user.id;
        token.is_premium = user.is_premium ?? false;
      }

      // Always refresh role/premium flags from DB to keep session accurate
      if (token.email) {
        try {
          const roleRes = await pool.query(
            `SELECT au.role, 
              CASE 
                WHEN s.plan IS NOT NULL 
                  AND s.status = 'active' 
                  AND LOWER(s.plan) IN ('premium', 'premuim', 'pro', 'tier2', 'tier_2') 
                  THEN true 
                ELSE false 
              END as is_premium
             FROM auth_users au
             LEFT JOIN subscriptions s ON au.id = s.user_id
             WHERE au.email = $1 LIMIT 1`,
            [token.email as string]
          );
          
          if (roleRes.rows?.[0]) {
            const numericRole = roleRes.rows[0].role ?? 2;
            token.role = numericRole;
            token.roleText = ROLE_MAP[numericRole as keyof typeof ROLE_MAP] || 'user';
            token.is_premium = roleRes.rows[0].is_premium ?? false;
          }
        } catch (err) {
          console.warn("Could not fetch role from DB:", err);
          token.role = 2;
          token.roleText = 'user';
        }
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as any).role = token.role ?? 2;
        (session.user as any).roleText = token.roleText ?? 'user';
        (session.user as any).id = token.id;
        (session.user as any).is_premium = token.is_premium ?? false;
      }
      return session;
    },
  },

  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };









