const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ai_ideas_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running migration 011: Fix document_versions table...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations/011_fix_document_versions_table.sql'),
      'utf8'
    );
    
    await client.query(migrationSQL);
    
    console.log('✅ Migration 011 completed successfully!');
    
    // Verify the columns
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'document_versions'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 document_versions table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);



