import { db } from '../src/lib/db.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🚀 Removing UNIQUE constraint on brief_id...\n');

    const migrationFile = path.join(__dirname, '007_remove_unique_brief_id.sql');
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    await db.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

runMigration();













