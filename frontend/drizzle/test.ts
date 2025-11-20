import pool from "@/lib/db";
import { users } from "@/drizzle/schema";

const db = pool;

async function main() {
  // Insert
  await db.query(
    'INSERT INTO users (email, name) VALUES ($1, $2)',
    ["test@example.com", "Test User"]
  );

  // Select
  const allUsersResult = await db.query('SELECT * FROM users');
  console.log(allUsersResult.rows);
}

main();