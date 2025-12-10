import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { llmClient, AIProvider } from '../lib/llmClient.js';
import { ragService } from '../services/rag.service.js';

interface GenerateStreamBody {
  prompt: string;
  temperature?: number;
  useRAG?: boolean;
  searchFilters?: {
    author?: string;
    tags?: string[];
  };
}

/**
 * Generic streaming generation endpoint
 * Used for AI-assisted editing and content generation
 */
export async function generateRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/generate-stream
   * Generic streaming content generation with optional RAG
   */
  fastify.post('/generate-stream', async (
    request: FastifyRequest<{ Body: GenerateStreamBody }>,
    reply: FastifyReply
  ) => {
    const { prompt, temperature = 0.7, useRAG = false, searchFilters } = request.body;

    if (!prompt) {
      return reply.status(400).send({
        success: false,
        error: 'Prompt is required',
      });
    }

    console.log(`🤖 Streaming generation request${useRAG ? ' (RAG-enabled)' : ''}`, {
      promptLength: prompt.length,
      temperature,
      useRAG,
    });

    // Set SSE headers
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Accel-Buffering': 'no',
    });

    try {
      let enhancedPrompt = prompt;

      // If RAG is enabled, enhance prompt with context
      if (useRAG) {
        try {
          // Extract key terms from prompt for search
          const searchQuery = prompt.slice(0, 500); // Use first 500 chars as query
          
          const ragResults = await ragService.search(searchQuery, {
            limit: 3,
            author: searchFilters?.author,
            tags: searchFilters?.tags,
          });

          if (ragResults.length > 0) {
            const context = ragResults
              .map((r, i) => `[${i + 1}] ${r.content}`)
              .join('\n\n');
            
            enhancedPrompt = `Use the following context from the knowledge base to enhance your response:\n\n${context}\n\n---\n\n${prompt}`;
            
            console.log(`📚 RAG: Enhanced with ${ragResults.length} documents`);
          }
        } catch (ragError) {
          console.error('RAG enhancement error:', ragError);
          // Continue without RAG if it fails
        }
      }

      // Stream LLM response
      let hasContent = false;
      let chunkCount = 0;
      let totalContentLength = 0;
      
      try {
        console.log('🔄 Starting LLM stream...');
        
        // Determine provider based on model name
        const modelName = process.env.LLM_MODEL || 'gpt-4o-mini';
        const useOpenAI = modelName.includes('gpt') || modelName.includes('openai');
        const provider: AIProvider = useOpenAI ? AIProvider.OPENAI : AIProvider.GEMINI;
        
        console.log(`🤖 Using provider: ${provider}, model: ${modelName}`);
        
        const stream = llmClient.generateCompletionStream(enhancedPrompt, {
          temperature,
          model: modelName,
          provider: provider, // Force correct provider
        });

        console.log('📡 Reading from LLM stream...');
        for await (const chunk of stream) {
          chunkCount++;
          if (chunk && typeof chunk === 'string' && chunk.trim()) {
            hasContent = true;
            totalContentLength += chunk.length;
            const data = JSON.stringify({ content: chunk });
            reply.raw.write(`data: ${data}\n\n`);
            
            // Log every 10 chunks to avoid spam
            if (chunkCount % 10 === 0) {
              console.log(`📊 Stream progress: ${chunkCount} chunks, ${totalContentLength} chars`);
            }
          } else {
            console.warn(`⚠️ Empty or invalid chunk #${chunkCount}:`, typeof chunk, chunk?.substring?.(0, 50));
          }
        }

        console.log(`📊 Stream finished: ${chunkCount} chunks processed, ${totalContentLength} total chars`);

        // Check if any content was generated
        if (!hasContent) {
          console.error('❌ No content generated from LLM stream!');
          console.error('Prompt length:', enhancedPrompt.length);
          console.error('Chunks received:', chunkCount);
          
          const errorData = JSON.stringify({
            error: 'No content generated from AI. This might be due to:\n1. API key issues\n2. Model unavailable\n3. Prompt too long\n4. Network issues\n\nPlease check backend logs and try again.',
          });
          reply.raw.write(`data: ${errorData}\n\n`);
        } else {
          console.log(`✅ Content generated successfully: ${totalContentLength} characters`);
        }

        // Send completion signal
        reply.raw.write('data: [DONE]\n\n');
        reply.raw.end();

        console.log(`✅ Streaming generation completed${hasContent ? ` with ${totalContentLength} chars` : ' (empty)'}`);
      } catch (streamError) {
        console.error('❌ Error during streaming:', streamError);
        console.error('Error stack:', streamError instanceof Error ? streamError.stack : 'No stack');
        
        const errorData = JSON.stringify({
          error: streamError instanceof Error ? streamError.message : 'Streaming error occurred',
        });
        reply.raw.write(`data: ${errorData}\n\n`);
        reply.raw.end();
        return;
      }
    } catch (error) {
      console.error('Error in streaming generation:', error);
      
      const errorData = JSON.stringify({
        error: error instanceof Error ? error.message : 'Generation failed',
      });
      reply.raw.write(`data: ${errorData}\n\n`);
      reply.raw.end();
    }
  });
}

