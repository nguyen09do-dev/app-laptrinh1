import pg from 'pg';

const { Pool } = pg;

/**
 * Database connection pool
 * Sử dụng Pool để quản lý nhiều kết nối hiệu quả
 *
 * IMPORTANT: Configure pool limits to prevent connection leaks
 */
export const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/ai_ideas_db',
  // Connection pool configuration to prevent leaks and improve performance
  max: 10, // Reduced from 20 - fewer connections but more stable
  min: 2, // Minimum number of clients in the pool
  idleTimeoutMillis: 20000, // Close idle clients after 20 seconds (reduced)
  connectionTimeoutMillis: 5000, // Faster timeout - 5 seconds
  // Query timeout
  query_timeout: 30000, // 30 seconds max for any query
  // Statement timeout in connection string will override this
  statement_timeout: 30000, // 30 seconds max for any statement
  // Allow pool to remove idle connections
  allowExitOnIdle: false,
});

// Xử lý lỗi kết nối
db.on('error', (err: Error) => {
  console.error('❌ Database connection error:', err);
});

// Log pool statistics periodically (for debugging)
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    console.log(`📊 DB Pool: ${db.totalCount} total, ${db.idleCount} idle, ${db.waitingCount} waiting`);
  }, 30000); // Every 30 seconds
}

// Xử lý khi tắt ứng dụng
process.on('SIGINT', async () => {
  await db.end();
  console.log('📦 Database pool closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await db.end();
  console.log('📦 Database pool closed');
  process.exit(0);
});
