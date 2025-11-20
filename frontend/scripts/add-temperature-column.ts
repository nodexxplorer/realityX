// Script to add temperature column to chats table
// Run with: npx tsx scripts/add-temperature-column.ts
// Or: ts-node scripts/add-temperature-column.ts

import pool from '../lib/db';

async function addTemperatureColumn() {
  try {
    console.log('🔄 Adding temperature column to chats table...');

    // Check if column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'chats' AND column_name = 'temperature'
    `);

    if (checkResult.rows.length > 0) {
      console.log('✅ Temperature column already exists!');
      return;
    }

    // Add the column
    await pool.query(`
      ALTER TABLE chats 
      ADD COLUMN temperature DECIMAL(3,2) DEFAULT 0.65 
      CHECK (temperature >= 0.0 AND temperature <= 2.0)
    `);

    // Add comment
    await pool.query(`
      COMMENT ON COLUMN chats.temperature IS 
      'AI model temperature parameter (0.0-2.0). Lower values are more focused, higher values are more creative. Default: 0.65'
    `);

    // Create index
    await pool.query(`
      CREATE INDEX idx_chats_temperature ON chats(temperature)
    `);

    // Update existing rows
    const updateResult = await pool.query(`
      UPDATE chats 
      SET temperature = 0.65 
      WHERE temperature IS NULL
    `);

    console.log(`✅ Successfully added temperature column!`);
    console.log(`   Updated ${updateResult.rowCount} existing rows with default temperature (0.65)`);
    console.log(`   Column type: DECIMAL(3,2) with CHECK constraint (0.0-2.0)`);
    console.log(`   Index created for faster queries`);

  } catch (error) {
    console.error('❌ Error adding temperature column:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
addTemperatureColumn()
  .then(() => {
    console.log('✨ Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });

