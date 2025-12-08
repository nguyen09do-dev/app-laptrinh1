import 'dotenv/config';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

/**
 * RAG Migration Runner
 * Runs the 004_setup_rag_system.sql migration to set up pgvector and RAG tables
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/ai_ideas_db',
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting RAG system migration...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '004_alter_rag_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file:', migrationPath);
    console.log('📝 SQL length:', migrationSQL.length, 'characters\n');

    // Begin transaction
    await client.query('BEGIN');

    console.log('⚙️  Executing migration...');

    // Execute migration
    await client.query(migrationSQL);

    // Commit transaction
    await client.query('COMMIT');

    console.log('\n✅ Migration completed successfully!\n');

    // Verify installation
    console.log('🔍 Verifying installation...\n');

    // Check pgvector extension
    const extensionCheck = await client.query(`
      SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'
    `);

    if (extensionCheck.rows.length > 0) {
      console.log('✅ pgvector extension:', extensionCheck.rows[0].extversion);
    } else {
      console.log('❌ pgvector extension not found!');
    }

    // Check tables
    const tables = ['documents', 'document_chunks', 'document_versions', 'citations'];

    for (const table of tables) {
      const tableCheck = await client.query(`
        SELECT COUNT(*) as count FROM information_schema.tables
        WHERE table_name = $1
      `, [table]);

      if (parseInt(tableCheck.rows[0].count) > 0) {
        console.log(`✅ Table '${table}' created`);
      } else {
        console.log(`❌ Table '${table}' not found!`);
      }
    }

    // Check functions
    const functions = ['search_documents', 'search_document_chunks', 'validate_citation_doc_ids'];

    for (const func of functions) {
      const funcCheck = await client.query(`
        SELECT COUNT(*) as count FROM pg_proc
        WHERE proname = $1
      `, [func]);

      if (parseInt(funcCheck.rows[0].count) > 0) {
        console.log(`✅ Function '${func}' created`);
      } else {
        console.log(`❌ Function '${func}' not found!`);
      }
    }

    // Check indexes
    const indexCheck = await client.query(`
      SELECT indexname FROM pg_indexes
      WHERE tablename IN ('documents', 'document_chunks')
      AND indexname LIKE '%hnsw%'
    `);

    console.log(`✅ Vector indexes created: ${indexCheck.rows.length}`);
    indexCheck.rows.forEach(row => {
      console.log(`   - ${row.indexname}`);
    });

    console.log('\n🎉 RAG system is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Test document ingestion: POST /api/rag/ingest');
    console.log('3. Test semantic search: GET /api/rag/search?query=your+query');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('\n✨ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
