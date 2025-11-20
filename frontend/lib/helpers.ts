// lib/helpers.ts
import pool from "./db";

export async function logUsage(userId: string, feature: string) {
  await pool.query(
    `INSERT INTO usage_logs (user_id, feature, used_at) VALUES ($1, $2, NOW())`,
    [userId, feature]
  );
}

