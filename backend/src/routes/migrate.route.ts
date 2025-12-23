/**
 * Emergency migration endpoint - run this to fix database
 * DELETE THIS FILE after migration completes!
 */
import { FastifyInstance } from 'fastify';
import db from '../lib/db.js';

export default async function migrateRoutes(fastify: FastifyInstance) {
  // POST /api/migrate/fix-content-packs
  fastify.post('/api/migrate/fix-content-packs', async (request, reply) => {
    try {
      // Add brief_id column if not exists
      await db.query(`
        ALTER TABLE content_packs 
        ADD COLUMN IF NOT EXISTS brief_id INTEGER REFERENCES briefs(id);
      `);

      reply.send({ 
        success: true, 
        message: 'Migration completed: brief_id added to content_packs' 
      });
    } catch (error: any) {
      console.error('Migration error:', error);
      reply.status(500).send({ 
        success: false, 
        error: error.message 
      });
    }
  });
}
