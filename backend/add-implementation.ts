import 'dotenv/config';
import { db } from './src/lib/db.js';
import { readFileSync } from 'fs';

async function addImplementationColumn() {
  try {
    console.log('🔧 Adding implementation column...');

    const sql = readFileSync('add-implementation-column.sql', 'utf8');
    await db.query(sql);

    console.log('✅ Implementation column added successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

addImplementationColumn();
