import pg from 'pg';

const { Pool } = pg;

/**
 * Database connection pool
 * Sử dụng Pool để quản lý nhiều kết nối hiệu quả
 */
export const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/ai_ideas_db',
});

// Xử lý lỗi kết nối
db.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Xử lý khi tắt ứng dụng
process.on('SIGINT', async () => {
  await db.end();
  console.log('📦 Database pool closed');
  process.exit(0);
});




