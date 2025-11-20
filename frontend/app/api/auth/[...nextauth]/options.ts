// // app/api/auth/[...nextauth]/options.ts



// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { createClient } from "@supabase/supabase-js";
// import pool from "@/lib/db";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// // Role mapping
// const ROLE_MAP = {
//   2: 'user',
//   3: 'contributor',
//   4: 'admin',
// } as const;

// async function upsertAuthUser(email: string, name?: string | null, supabaseId?: string | null) {
//   // Default role level is 2 (user) for new users
//   const defaultRoleLevel = 2;
  
//   const res = await pool.query(
//     `INSERT INTO auth_users (
//       id, 
//       supabase_id, 
//       email, 
//       name, 
//       role,  
//       created_at
//     )
//     VALUES ($1, $2, $3, $4, $5, NOW())
//     ON CONFLICT (email) DO UPDATE
//       SET supabase_id = COALESCE(EXCLUDED.supabase_id, auth_users.supabase_id),
//           name = COALESCE(EXCLUDED.name, auth_users.name),
//           role = COALESCE(auth_users.role, $5),
//           updated_at = NOW()
//     RETURNING id;`,
//     [
//       supabaseId ?? crypto.randomUUID(), 
//       supabaseId, 
//       email, 
//       name ?? null,
//       defaultRoleLevel
//     ]
//   );
//   return res.rows[0].id;
// }

// async function ensureProfile(internalId: string, name?: string | null) {
//   await pool.query(
//     `INSERT INTO profiles (user_id, name, created_at, updated_at)
//      VALUES ($1, $2, NOW(), NOW())
//      ON CONFLICT (user_id) DO UPDATE
//        SET name = COALESCE(EXCLUDED.name, profiles.name),
//            updated_at = NOW();`,
//     [internalId, name ?? null]
//   );

//   const subCheck = await pool.query(`SELECT 1 FROM subscriptions WHERE user_id = $1 LIMIT 1`, [internalId]);
//   if (subCheck.rowCount === 0) {
//     await pool.query(
//       `INSERT INTO subscriptions (user_id, plan, status, credits, active, created_at, updated_at)
//        VALUES ($1, 'free', 'active', 100, true, NOW(), NOW());`,
//       [internalId]
//     );
//   }
// }

// export const authOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials.password) throw new Error("Missing email or password");

//         const { data, error } = await supabase.auth.signInWithPassword({
//           email: credentials.email,
//           password: credentials.password,
//         });

//         if (error || !data.user) throw new Error(error?.message ?? "Login failed");

//         const user = data.user;

//         // ✅ If user clicked verification link, update verified fields
//         if (!user.email_confirmed_at) throw new Error("Email not verified");

//         const internalId = await upsertAuthUser(user.email!, user.user_metadata?.name ?? null, user.id);

//         // Update local DB with verified timestamp
//         await pool.query(
//           `UPDATE auth_users SET verified = true, email_verified = $1 WHERE email = $2`,
//           [user.email_confirmed_at, user.email]
//         );
//         await pool.query(
//           `UPDATE profiles SET verified = true, email_verified = $1 WHERE user_id = $2`,
//           [user.email_confirmed_at, internalId]
//         );

//         await ensureProfile(internalId, user.user_metadata?.name ?? null);
        
//         // ✅ Fetch role from database (now numeric)
//         const userDataQuery = await pool.query(
//           `SELECT 
//             au.role,
//             s.plan,
//             s.status,
//             CASE WHEN s.plan IN ('premium', 'pro') AND s.status = 'active' THEN true ELSE false END as is_premium
//           FROM auth_users au
//           LEFT JOIN subscriptions s ON au.id = s.user_id
//           WHERE au.id = $1`,
//           [internalId]
//         );

//         const userData = userDataQuery.rows[0];
//         const numericRole = userData?.role || 2;
//         const roleText = ROLE_MAP[numericRole as keyof typeof ROLE_MAP] || 'user';

//         return {
//           id: internalId,
//           email: user.email!,
//           name: user.user_metadata?.name ?? null,
//           role: numericRole, // ✅ Return numeric role
//           roleText: roleText,
//           is_premium: false,
//           usage_limit: 4,
//         } as any;
//       },
//     }),
//   ],

//   session: { strategy: "jwt" as const, maxAge: 30 * 24 * 60 * 60 },

//   callbacks: {
//     async jwt({ token, user }: any) {
//       if (user) {
//         Object.assign(token, user);
//       }

//       // If token lacks a role, try to fetch it from DB
//       if ((!token.role || token.role === "undefined") && token.email) {
//         try {
//           const roleRes = await pool.query(
//             `SELECT role FROM auth_users WHERE email = $1 LIMIT 1`,
//             [token.email]
//           );
          
//           if (roleRes.rows?.[0]) {
//             const numericRole = roleRes.rows[0].role ?? 2;
//             token.role = numericRole;
//             token.roleText = ROLE_MAP[numericRole as keyof typeof ROLE_MAP] || 'user';
//           }
//         } catch (err) {
//           console.warn("Could not fetch role from DB:", err);
//         }
//       }
//       return token;
//     },

//     async session({ session, token }: any) {
//       if (session?.user) {
//         Object.assign(session.user, token);
        
//         // Ensure numeric role is set
//         session.user.role = token.role ?? 2;
//         session.user.roleText = ROLE_MAP[session.user.role as keyof typeof ROLE_MAP] || 'user';
        
//         // Normalize premium status
//         session.user.is_premium = token.is_premium ?? false;
//       }
//       return session;
//     },
//   },

//   pages: { signIn: "/login", error: "/login" },
//   secret: process.env.NEXTAUTH_SECRET,

// };

