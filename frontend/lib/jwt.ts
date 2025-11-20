// lib/jwt.ts

import jwt from "jsonwebtoken";

const secret = process.env.NEXTAUTH_SECRET;
if (!secret) {
  throw new Error("JWT secret is not defined in NEXTAUTH_SECRET");
}

export function signJwtToken(payload: Record<string, any>) {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyJwtToken<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, secret) as T;
  } catch (error) {
    return null;
  }
}
