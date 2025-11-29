import { FastifyRequest, FastifyReply } from 'fastify';
import { contentsService } from '../services/contents.service.js';

export class ContentsController {
  async getAllContents(request: FastifyRequest, reply: FastifyReply) {
    try {
      const contents = await contentsService.getAllContents();
      return reply.send({ success: true, data: contents, count: contents.length });
    } catch (error) {
      console.error('Error getting contents:', error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch contents' });
    }
  }

  async getContentById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const id = parseInt(request.params.id);
      if (isNaN(id)) {
        return reply.status(400).send({ success: false, error: 'Invalid content ID' });
      }

      const content = await contentsService.getContentById(id);
      if (!content) {
        return reply.status(404).send({ success: false, error: 'Content not found' });
      }

      return reply.send({ success: true, data: content });
    } catch (error) {
      console.error('Error getting content:', error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch content' });
    }
  }

  async generateContentFromBrief(request: FastifyRequest<{ Params: { briefId: string } }>, reply: FastifyReply) {
    try {
      const briefId = parseInt(request.params.briefId);
      if (isNaN(briefId)) {
        return reply.status(400).send({ success: false, error: 'Invalid brief ID' });
      }

      console.log(`📝 Generating content from brief ${briefId}`);
      const content = await contentsService.generateContentFromBrief(briefId);

      return reply.send({ success: true, data: content, message: 'Content generated successfully' });
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('not found') || errorMessage.includes('already exists')) {
        return reply.status(400).send({ success: false, error: errorMessage });
      }

      return reply.status(500).send({ success: false, error: `Failed to generate content: ${errorMessage}` });
    }
  }

  async deleteContent(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const id = parseInt(request.params.id);
      if (isNaN(id)) {
        return reply.status(400).send({ success: false, error: 'Invalid content ID' });
      }

      const deleted = await contentsService.deleteContent(id);
      if (!deleted) {
        return reply.status(404).send({ success: false, error: 'Content not found' });
      }

      return reply.send({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
      console.error('Error deleting content:', error);
      return reply.status(500).send({ success: false, error: 'Failed to delete content' });
    }
  }
}

export const contentsController = new ContentsController();
