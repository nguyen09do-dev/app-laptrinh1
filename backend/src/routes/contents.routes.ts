import { FastifyInstance } from 'fastify';
import { contentsController } from '../controllers/contents.controller.js';

export async function contentsRoutes(fastify: FastifyInstance) {
  fastify.get('/contents', {
    handler: contentsController.getAllContents.bind(contentsController),
  });

  fastify.get('/contents/:id', {
    handler: contentsController.getContentById.bind(contentsController),
  });

  fastify.post('/contents/from-brief/:briefId', {
    handler: contentsController.generateContentFromBrief.bind(contentsController),
  });

  fastify.delete('/contents/:id', {
    handler: contentsController.deleteContent.bind(contentsController),
  });
}
