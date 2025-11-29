import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/ai_ideas_db';
  const pool = new Pool({
    connectionString: dbUrl,
  });

  try {
    console.log('🔄 Running contents table migration...');

    const sqlFile = join(__dirname, 'add-contents-table.sql');
    const sql = readFileSync(sqlFile, 'utf-8');

    await pool.query(sql);

    console.log('✅ Contents table migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();
