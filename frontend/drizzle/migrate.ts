// drizzle/migrate.ts
import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

// Load environment variables from .env file
config({ path: '.env' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
}

const db = drizzle(postgres(connectionString, { ssl: 'require' })); // Ensure SSL is required for Supabase

async function main() {
  try {
    console.log('Starting migrations...');
    await migrate(db, { migrationsFolder: 'drizzle/migrations' }); // Point to your migrations folder
    console.log('Migrations finished!');
    process.exit(0);
  } catch (error) {
    console.error('Migrations failed!', error);
    process.exit(1);
  }
}

main();