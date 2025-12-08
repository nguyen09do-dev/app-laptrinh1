import { db } from './src/lib/db.js';
import fs from 'fs';
import path from 'path';

async function runMigration(filePath: string, name: string) {
  console.log(`\n🔧 Running ${name}...`);
  try {
    const sql = fs.readFileSync(filePath, 'utf-8');
    await db.query(sql);
    console.log(`✅ ${name} completed successfully`);
  } catch (error: any) {
    console.error(`❌ Error in ${name}:`, error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('=== RUNNING ALL DATABASE MIGRATIONS ===\n');

    // 1. Content Packs migration
    await runMigration(
      path.join(process.cwd(), 'migrations/002_add_content_packs.sql'),
      'Content Packs Migration'
    );

    // 2. Contents columns fix
    await runMigration(
      path.join(process.cwd(), 'migrations/003_fix_contents_columns.sql'),
      'Contents Columns Fix'
    );

    // 3. Check tables
    console.log('\n📋 Checking database tables...');

    const tablesResult = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\nExisting tables:');
    tablesResult.rows.forEach((row: any) => {
      console.log(`  - ${row.table_name}`);
    });

    // 4. Check content_packs structure
    console.log('\n📋 content_packs table structure:');
    const packsSchema = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'content_packs'
      ORDER BY ordinal_position
    `);
    console.table(packsSchema.rows);

    // 5. Check contents structure
    console.log('\n📋 contents table structure:');
    const contentsSchema = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'contents'
      ORDER BY ordinal_position
    `);
    console.table(contentsSchema.rows);

    // 6. Check briefs structure
    console.log('\n📋 briefs table structure:');
    const briefsSchema = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'briefs'
      ORDER BY ordinal_position
    `);
    console.table(briefsSchema.rows);

    console.log('\n✅ All migrations completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
