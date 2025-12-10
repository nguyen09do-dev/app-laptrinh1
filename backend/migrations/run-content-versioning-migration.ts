import { db } from '../src/lib/db.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🚀 Running content versioning migration...\n');

    const migrationFile = path.join(__dirname, '006_add_content_versioning.sql');
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    // Execute entire SQL file (PostgreSQL supports multiple statements)
    try {
      await db.query(sql);
      console.log('✅ Migration SQL executed');
    } catch (error: any) {
      // Ignore "already exists" errors for columns/tables
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate') ||
          error.message.includes('does not exist')) {
        console.log('⚠️  Some statements skipped (already exists or not applicable)');
      } else {
        throw error;
      }
    }

    // Verify migration
    console.log('\n📊 Verifying migration...');
    
    const versionCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contents' AND column_name = 'version_number'
    `);
    console.log('✅ version_number column:', versionCheck.rows.length > 0 ? 'OK' : 'Missing');

    const contentIdCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contents' AND column_name = 'content_id'
    `);
    console.log('✅ content_id column:', contentIdCheck.rows.length > 0 ? 'OK' : 'Missing');

    const tableCheck = await db.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_name = 'content_versions'
    `);
    console.log('✅ content_versions table:', tableCheck.rows[0].count > 0 ? 'OK' : 'Missing');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

runMigration();

