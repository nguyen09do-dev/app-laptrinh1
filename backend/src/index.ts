import 'dotenv/config'; // Load environment variables first
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { ideasRoutes } from './routes/ideas.routes.js';
import { briefsRoutes } from './routes/briefs.routes.js';
import { contentsRoutes } from './routes/contents.routes.js';
import { analyticsRoutes } from './routes/analytics.routes.js';
import { settingsRoutes } from './routes/settings.routes.js';
import { packsRoutes } from './routes/packs.routes.js';
import { ragRoutes } from './routes/rag.routes.js';
import { generateRoutes } from './routes/generate.routes.js';
import { integrationsRoutes } from './routes/integrations.routes.js';
import { db } from './lib/db.js';

// Tạo Fastify instance
const fastify = Fastify({
  logger: true, // Bật logging để debug
  requestTimeout: 30000, // 30 seconds timeout for requests
  keepAliveTimeout: 5000, // 5 seconds keep-alive
  bodyLimit: 10 * 1024 * 1024, // 10MB body limit
});

// Đăng ký CORS để frontend có thể gọi API
fastify.register(cors, {
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'https://app-laptrinh1.vercel.app', // Production Vercel URL
    /\.vercel\.app$/ // Allow all Vercel preview deployments
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Đăng ký multipart/form-data support cho file upload
fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 1, // Max 1 file at a time
  },
});

// Đăng ký routes
fastify.register(ideasRoutes, { prefix: '/api' });
fastify.register(briefsRoutes, { prefix: '/api' });
fastify.register(contentsRoutes, { prefix: '/api' });
fastify.register(analyticsRoutes, { prefix: '/api' });
fastify.register(settingsRoutes, { prefix: '/api' });
fastify.register(packsRoutes, { prefix: '/api' });
fastify.register(ragRoutes); // RAG routes already have /api prefix
fastify.register(generateRoutes, { prefix: '/api' }); // Generic streaming generation
fastify.register(integrationsRoutes, { prefix: '/api' }); // Third-party integrations

// Health check endpoint
fastify.get('/health', async () => {
  try {
    // Quick database check
    await db.query('SELECT 1');
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      pool: {
        total: db.totalCount,
        idle: db.idleCount,
        active: db.totalCount - db.idleCount,
      }
    };
  } catch (error) {
    return { 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  // Handle timeout errors
  if (error.code === 'FST_ERR_REQ_TIMEOUT') {
    return reply.status(504).send({
      success: false,
      error: 'Request timeout - Server đang xử lý quá lâu. Vui lòng thử lại.',
    });
  }
  
  // Handle database connection errors
  if (error.code === 'ECONNREFUSED' || error.message?.includes('connection')) {
    return reply.status(503).send({
      success: false,
      error: 'Database connection error - Vui lòng kiểm tra database đã chạy chưa.',
    });
  }
  
  // Default error response
  return reply.status(error.statusCode || 500).send({
    success: false,
    error: error.message || 'Internal server error',
  });
});

// Hàm khởi động server
const start = async () => {
  try {
    // Kiểm tra kết nối database
    await db.query('SELECT NOW()');
    console.log('✅ Database connected successfully');

    // Khởi động server
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📚 RAG endpoints available at http://localhost:${port}/api/rag`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Chạy server
start();
