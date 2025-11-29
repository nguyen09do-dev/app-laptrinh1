import 'dotenv/config';
import { db } from './src/lib/db.js';
import { readFileSync } from 'fs';

async function runMigration() {
  try {
    console.log('🔧 Running database migration...');

    const sql = readFileSync('fix_database.sql', 'utf8');
    await db.query(sql);

    console.log('✅ Database migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
