import { db } from '../src/lib/db.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🚀 Adding pack_id column to contents table...\n');

    const migrationFile = path.join(__dirname, '008_add_pack_id_to_contents.sql');
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    await db.query(sql);
    console.log('✅ Migration completed successfully!');
    
    // Verify
    const check = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contents' AND column_name = 'pack_id'
    `);
    console.log('✅ pack_id column:', check.rows.length > 0 ? 'OK' : 'Missing');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

runMigration();

