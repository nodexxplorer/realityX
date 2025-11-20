// lib/db.ts
import { Pool } from "pg";

declare global {
  // @ts-ignore
  var _pgPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const pool =
  global._pgPool ??
  new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

if (process.env.NODE_ENV !== "production") {
  // @ts-ignore
  global._pgPool = pool;
}

export default pool;

