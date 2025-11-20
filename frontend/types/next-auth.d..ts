// types/next-auth.d.ts

import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      nickname?: string | null; 
      role?: number;
      user_role?: number;
      image?: string;
      is_premium: boolean;
      plan?: string;
      plan_expiry?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    role?: number;
    user_role?: number;
    image?: string;
    is_premium: boolean;
    plan?: string;
    plan_expiry?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string;
    name?: string;
    role?: number;
    is_premium: boolean;
    plan?: string;
    plan_expiry?: string | null;
  }
}


