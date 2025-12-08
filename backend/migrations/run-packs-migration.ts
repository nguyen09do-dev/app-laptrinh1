import 'dotenv/config';
import { db } from '../src/lib/db.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('🔧 Running content_packs migration...');

    const sqlPath = join(__dirname, '002_add_content_packs.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    await db.query(sql);

    console.log('✅ content_packs table migration completed successfully');
    
    // Verify table was created
    const result = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'content_packs'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 content_packs table schema:');
    console.table(result.rows);

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();



