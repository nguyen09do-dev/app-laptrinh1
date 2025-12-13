import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/ai_ideas_db',
  });

  try {
    console.log('🚀 Running integration_credentials migration...');

    // Read migration file
    const migrationSQL = readFileSync(
      join(__dirname, '009_add_integration_credentials.sql'),
      'utf-8'
    );

    // Execute migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
