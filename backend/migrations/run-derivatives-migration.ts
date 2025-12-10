/**
 * Run derivatives migration
 * Usage: npx tsx migrations/run-derivatives-migration.ts
 */

import { db } from '../src/lib/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🔧 Running derivatives migration (005)...\n');

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, '005_add_derivatives.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Execute migration
    await db.query(sql);

    console.log('\n✅ Migration 005 (derivatives) completed successfully!\n');

    // Verify by checking table structure
    const columnsResult = await db.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'content_packs' AND column_name = 'derivatives'
    `);

    if (columnsResult.rows.length > 0) {
      console.log('📊 Verified derivatives column:');
      console.log('   Column:', columnsResult.rows[0].column_name);
      console.log('   Type:', columnsResult.rows[0].data_type);
      console.log('   Default:', columnsResult.rows[0].column_default);
    }

    // Check derivative_versions table
    const tableResult = await db.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name = 'derivative_versions'
    `);

    console.log('\n📊 derivative_versions table:', tableResult.rows[0].count > 0 ? '✅ Created' : '❌ Missing');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await db.end();
  }
}

runMigration().catch((err) => {
  console.error(err);
  process.exit(1);
});


