const db = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('📦 Running migration 010...');
    
    const migrationPath = path.join(__dirname, 'migrations', '010_add_social_platforms_to_integrations.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await db.query(sql);
    
    console.log('✅ Migration 010 completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

