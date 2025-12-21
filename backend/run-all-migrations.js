/**
 * Run all database migrations in order
 * Usage: node backend/run-all-migrations.js
 * Or via Railway: railway run node backend/run-all-migrations.js
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Client } = pg;

// Migration files in order
const migrations = [
  '001_add_brief_flowmap_approved.sql',
  '002_add_content_packs.sql',
  '003_fix_contents_columns.sql',
  '004_setup_rag_system.sql',
  '005_add_derivatives.sql',
  '006_add_content_versioning.sql',
  '007_remove_unique_brief_id.sql',
  '008_add_pack_id_to_contents.sql',
  '009_add_integration_credentials.sql',
  '010_add_social_platforms_to_integrations.sql',
  '011_fix_document_versions_table.sql'
];

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable not set');
    process.exit(1);
  }

  console.log('🔗 Connecting to database...');
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    for (const migrationFile of migrations) {
      const filePath = path.join(__dirname, 'migrations', migrationFile);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Warning: Migration file not found: ${migrationFile}`);
        continue;
      }

      console.log(`📄 Running migration: ${migrationFile}`);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await client.query(sql);
        console.log(`✅ Success: ${migrationFile}\n`);
      } catch (error) {
        // Some migrations might fail if already applied (e.g., table exists)
        // Log but continue with other migrations
        if (error.message.includes('already exists')) {
          console.log(`⏭️  Skipped: ${migrationFile} (already applied)\n`);
        } else {
          console.error(`❌ Error in ${migrationFile}:`, error.message);
          console.log('⚠️  Continuing with remaining migrations...\n');
        }
      }
    }

    console.log('🎉 All migrations completed!');
    console.log('\n📊 Database tables:');
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run migrations
runMigrations();
