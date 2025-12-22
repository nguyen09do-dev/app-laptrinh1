# AI Content Platform - Claude Context

> This file provides context to Claude Code about your project conventions, patterns, and preferences.
> Claude will use this to generate code that matches your project style.

## Project Overview

**AI-Powered Content Generation & Multi-Platform Publishing System**

A comprehensive platform for creating AI-generated content and distributing it across multiple social media and marketing platforms.

### Core Capabilities
- **Idea Generation**: AI-powered brainstorming for content topics
- **Brief Creation**: Structured content outlines with key messages
- **Content Writing**: Full-length articles (~2000 words) in Vietnamese
- **Derivatives**: Multi-platform content variations (Twitter, LinkedIn, Email, Blog, SEO)
- **RAG System**: Knowledge base integration with document embeddings
- **Multi-Platform Publishing**: WordPress, Mailchimp, Facebook, Instagram, Twitter, LinkedIn, Zalo
- **Analytics**: Content performance tracking across platforms
- **Multi-Tenant**: Support for multiple users/teams

---

## Tech Stack

### Backend
- **Framework**: Fastify v4 + TypeScript
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL 16 with pgvector extension (vector similarity search)
- **Database Driver**: pg (raw SQL, no ORM)
- **Validation**: AJV (JSON Schema)
- **Authentication**: Session-based (connect-pg-simple)
- **AI Providers**:
  - OpenAI (gpt-4o-mini, text-embedding-3-small)
  - Google Gemini (gemini-2.5-flash, text-embedding-004)
  - Abstraction layer: `src/lib/llmClient.ts`
- **Document Processing**:
  - PDF: pdf-parse
  - DOCX: mammoth
  - HTML: cheerio
- **API Design**: RESTful JSON APIs

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **UI Components**: Custom components (no component library)
- **State Management**: React hooks + Server Components
- **HTTP Client**: Native fetch API
- **Markdown**: react-markdown
- **Charts**: recharts
- **Animations**: framer-motion

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Package Manager**: npm
- **Development**: Hot reload (npm run dev)
- **Deployment**: Self-hosted

### Directory Structure
```
G:\Code01-HWAIcontentmulti\
├── backend/
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── controllers/      # HTTP request handlers
│   │   ├── services/         # Business logic
│   │   ├── lib/              # Utilities (DB, LLM client)
│   │   ├── schema/           # AJV validation schemas
│   │   └── middleware/       # Request processing
│   ├── .env                  # Environment variables
│   └── server.ts             # Entry point
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── ideas/
│   │   ├── briefs/
│   │   ├── content/
│   │   ├── derivatives/
│   │   ├── publisher/
│   │   ├── documents/
│   │   ├── analytics/
│   │   └── components/       # Reusable UI components
│   └── next.config.js
└── docker-compose.yml
```

---

## Code Conventions

### TypeScript
- **Strict Mode**: Enabled in tsconfig.json
- **Type Safety**:
  - Explicit return types for all functions
  - No `any` types (use `unknown` if necessary)
  - Interface for object shapes
  - Type for unions/primitives
- **Naming**:
  - Variables/Functions: camelCase
  - Interfaces/Types: PascalCase
  - Constants: UPPER_SNAKE_CASE
  - Files: kebab-case.ts

### Backend Patterns

#### API Routes
```typescript
// Pattern: /api/{resource}/{action}
GET    /api/ideas              # List all
GET    /api/ideas/:id          # Get one
POST   /api/ideas/generate     # Generate new
PUT    /api/ideas/:id          # Update
DELETE /api/ideas/:id          # Delete
```

#### Controller Structure
```typescript
// Controllers handle HTTP logic only
export async function generateIdeas(
  request: FastifyRequest<{ Body: GenerateIdeasRequest }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { persona, industry } = request.body;
    const userId = request.session.userId;

    // Call service for business logic
    const ideas = await ideasService.generateIdeas(userId, persona, industry);

    reply.send({ success: true, data: ideas });
  } catch (error) {
    reply.status(500).send({ success: false, error: error.message });
  }
}
```

#### Service Layer
```typescript
// Services contain business logic
export class IdeasService {
  async generateIdeas(
    userId: number,
    persona: string,
    industry: string
  ): Promise<Idea[]> {
    // 1. Build AI prompt
    const prompt = this.buildPrompt(persona, industry);

    // 2. Call AI provider
    const response = await llmClient.generateCompletion(prompt);

    // 3. Parse response
    const ideas = this.parseIdeas(response);

    // 4. Save to database
    await this.saveIdeas(userId, ideas);

    return ideas;
  }
}
```

#### Database Queries
```typescript
// Always use parameterized queries (prevent SQL injection)
const query = `
  SELECT id, title, description, created_at
  FROM ideas
  WHERE user_id = $1
  ORDER BY created_at DESC
`;
const result = await db.query(query, [userId]);

// Use transactions for multi-step operations
const client = await db.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO ideas ...');
  await client.query('INSERT INTO idea_metadata ...');
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

#### Error Handling
```typescript
// Custom error types
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Service-level error handling
try {
  const result = await dangerousOperation();
  return result;
} catch (error) {
  if (error instanceof ValidationError) {
    throw error; // Let controller handle
  }
  logger.error('Unexpected error:', error);
  throw new Error('Internal server error');
}
```

#### AI Provider Abstraction
```typescript
// backend/src/lib/llmClient.ts
export enum AIProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
}

export class LLMClient {
  async generateCompletion(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    // Route to appropriate provider
    const provider = process.env.DEFAULT_AI_PROVIDER || AIProvider.GEMINI;

    if (provider === AIProvider.OPENAI) {
      return this.generateWithOpenAI(prompt, options);
    } else {
      return this.generateWithGemini(prompt, options);
    }
  }

  // Streaming support
  async *generateCompletionStream(
    prompt: string,
    options?: { model?: string }
  ): AsyncGenerator<string> {
    // Yield chunks as they arrive
  }
}
```

### Frontend Patterns

#### Component Structure
```tsx
// Functional components only (no class components)
'use client'; // Only if client-side interactivity needed

import { useState, useEffect } from 'react';

interface ContentCardProps {
  title: string;
  description: string;
  onEdit?: () => void;
}

export function ContentCard({ title, description, onEdit }: ContentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
      {onEdit && (
        <button onClick={onEdit} className="mt-4 text-blue-600">
          Edit
        </button>
      )}
    </div>
  );
}
```

#### API Calls
```tsx
// Use fetch with proper error handling
async function fetchIdeas(): Promise<Idea[]> {
  try {
    const response = await fetch('http://localhost:3001/api/ideas', {
      credentials: 'include', // Include session cookies
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Request failed');
    }

    return data.data;
  } catch (error) {
    console.error('Failed to fetch ideas:', error);
    throw error;
  }
}
```

#### Form Handling
```tsx
// Controlled components
const [formData, setFormData] = useState({
  title: '',
  description: '',
});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    if (response.ok) {
      // Handle success
      router.push('/ideas');
    }
  } catch (error) {
    // Handle error
    setError(error.message);
  }
};
```

#### Styling
```tsx
// Tailwind CSS utility classes
<div className="flex flex-col gap-4">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
  <p className="text-gray-600">Description</p>
  <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
    Action
  </button>
</div>

// Responsive design
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Cards */}
</div>
```

---

## Database Schema

### Key Tables

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  persona TEXT,
  industry VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ideas
CREATE TABLE ideas (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contents
CREATE TABLE contents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  brief_id INTEGER REFERENCES briefs(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents (for RAG)
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_path TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Document Chunks (with embeddings)
CREATE TABLE document_chunks (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id),
  content TEXT NOT NULL,
  embedding vector(1536), -- pgvector
  chunk_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Integration Credentials
CREATE TABLE integration_credentials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  platform VARCHAR(100) NOT NULL,
  credentials JSONB NOT NULL, -- Encrypted API keys, tokens
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
```sql
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_contents_user_id ON contents(user_id);
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);

-- Vector similarity search
CREATE INDEX idx_document_chunks_embedding ON document_chunks
USING ivfflat (embedding vector_cosine_ops);
```

---

## Testing Strategy

### Backend Tests (Vitest)
```typescript
// Unit tests for services
describe('IdeasService', () => {
  it('should generate 10 ideas', async () => {
    const ideas = await ideasService.generateIdeas(1, 'Developer', 'Tech');
    expect(ideas).toHaveLength(10);
    expect(ideas[0]).toHaveProperty('title');
  });

  it('should handle AI provider errors', async () => {
    // Mock AI failure
    await expect(ideasService.generateIdeas(1, '', '')).rejects.toThrow();
  });
});
```

### Frontend Tests (Jest)
```typescript
// Component tests
describe('ContentCard', () => {
  it('renders title and description', () => {
    render(<ContentCard title="Test" description="Desc" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Integration Tests
- Manual testing for now
- Need to add: E2E tests with Playwright

---

## Development Workflow

### Git Workflow
```bash
# Branch naming
feature/add-instagram-reels
bugfix/fix-gemini-quota-error
refactor/simplify-llm-client

# Commit messages (Conventional Commits)
feat: Add Instagram Reels derivative support
fix: Handle Gemini quota exceeded errors
refactor: Simplify LLM provider switching logic
docs: Update API documentation for derivatives endpoint
test: Add unit tests for derivative generator

# Each commit should include Claude Code attribution
🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Code Review Checklist
- [ ] TypeScript strict mode compliance
- [ ] No `any` types
- [ ] Parameterized SQL queries (no SQL injection)
- [ ] Error handling with try-catch
- [ ] API keys not exposed in code/logs
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] Performance: No N+1 queries
- [ ] Security: Input validation with AJV

### Documentation
- **API Endpoints**: Inline JSDoc comments
- **Components**: PropTypes with TSDoc
- **Database**: Schema comments in migrations
- **Business Logic**: Comments for complex algorithms

---

## Common Patterns

### AI Content Generation
```typescript
// Standard flow
async function generateContent(userId: number, briefId: number): Promise<Content> {
  // 1. Get brief data
  const brief = await briefsService.getBrief(briefId);

  // 2. Build AI prompt
  const prompt = `
    Write a 2000-word article in Vietnamese about: ${brief.topic}

    Structure:
    - Introduction with hook (200 words)
    - Body with 3-4 paragraphs (1500 words)
    - Conclusion (300 words)

    Tone: ${brief.tone}
    Target audience: ${brief.target_audience}
  `;

  // 3. Generate with AI (with retry)
  const content = await llmClient.generateCompletion(prompt, {
    model: 'gpt-4',
    maxTokens: 3000,
  });

  // 4. Post-process
  const cleaned = cleanContent(content);
  const wordCount = countWords(cleaned);

  // 5. Save to database
  const savedContent = await contentsService.saveContent({
    userId,
    briefId,
    content: cleaned,
    wordCount,
  });

  return savedContent;
}
```

### RAG (Retrieval Augmented Generation)
```typescript
async function searchDocuments(
  userId: number,
  query: string,
  topK: number = 5
): Promise<DocumentChunk[]> {
  // 1. Generate query embedding
  const embedding = await embeddingService.generateEmbedding(query);

  // 2. Vector similarity search
  const results = await db.query(`
    SELECT dc.id, dc.content, dc.document_id, d.title,
           1 - (dc.embedding <=> $1::vector) AS similarity
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE d.user_id = $2
    ORDER BY dc.embedding <=> $1::vector
    LIMIT $3
  `, [embedding, userId, topK]);

  return results.rows;
}
```

### Multi-Platform Publishing
```typescript
async function publishToWordPress(
  userId: number,
  contentId: number
): Promise<void> {
  // 1. Get credentials
  const creds = await integrationsService.getCredentials(userId, 'wordpress');

  // 2. Format content
  const content = await contentsService.getContent(contentId);
  const formatted = formatForWordPress(content);

  // 3. Publish via API
  const response = await fetch(`${creds.site_url}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${creds.access_token}`,
    },
    body: JSON.stringify(formatted),
  });

  // 4. Track publication
  await publicationsService.recordPublication({
    contentId,
    platform: 'wordpress',
    externalId: response.data.id,
    publishedAt: new Date(),
  });
}
```

---

## Priorities & Preferences

### Development Priorities
1. **Type Safety**: TypeScript strict mode, no `any`
2. **Security**: SQL injection prevention, API key protection
3. **Code Quality**: Clean code > clever code
4. **Performance**: Optimize AI calls (expensive), cache when possible
5. **User Experience**: Fast response times, clear error messages
6. **Maintainability**: Clear structure, good documentation

### Performance Considerations
- **AI Calls**: Use streaming for long responses
- **Database**: Index foreign keys and search fields
- **Embeddings**: Batch generation (50-100 at a time)
- **Caching**: Consider Redis for frequently accessed data
- **Rate Limiting**: Respect AI provider limits

### Security Best Practices
- **Never** log API keys or tokens
- **Never** commit .env files (use .env.example)
- **Always** use parameterized queries
- **Always** validate user input (AJV schemas)
- **Always** sanitize content before display
- Encrypt integration credentials in database
- Use HTTPS in production
- Implement rate limiting for API endpoints

---

## Environment Variables

```bash
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
OPENAI_API_KEY=sk-proj-xxx
GEMINI_API_KEY=AIzaSy...
DEFAULT_AI_PROVIDER=gemini
PORT=3001
HOST=0.0.0.0
SESSION_SECRET=random-secret-key

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## When Generating Code

### Always:
- ✅ Use TypeScript with explicit types
- ✅ Follow existing patterns in the codebase
- ✅ Add error handling (try-catch)
- ✅ Validate inputs (AJV schemas for backend)
- ✅ Use parameterized SQL queries
- ✅ Add JSDoc comments for functions
- ✅ Follow Tailwind CSS for styling
- ✅ Use async/await (not .then() chains)
- ✅ Keep functions small and focused
- ✅ Write tests for new functionality

### Never:
- ❌ Use `any` type
- ❌ String concatenation in SQL queries
- ❌ Expose API keys in code
- ❌ Use class components (React)
- ❌ Mix `.then()` and `async/await`
- ❌ Ignore errors (empty catch blocks)
- ❌ Create god functions (>50 lines)
- ❌ Use inline styles (use Tailwind)
- ❌ Hardcode configuration values
- ❌ Skip input validation

---

## Current Focus Areas

### High Priority
1. Improve test coverage (currently minimal)
2. Add E2E tests with Playwright
3. Optimize AI token usage (expensive)
4. Better error handling and logging
5. Performance monitoring for AI calls

### Nice to Have
1. Redis caching for embeddings
2. Background job queue for long-running tasks
3. Webhooks for platform updates
4. Advanced analytics dashboard
5. A/B testing for content variations

---

## Questions to Ask Before Starting

When implementing new features, consider:

1. **Architecture**: Does this fit existing patterns?
2. **Testing**: What tests are needed?
3. **Performance**: Will this impact response times?
4. **Security**: Any new attack vectors?
5. **Cost**: AI token usage implications?
6. **Compatibility**: Works with all supported platforms?
7. **Documentation**: What needs updating?

---

*This context file helps Claude Code generate code that matches your project perfectly!*
*Last updated: 2025-12-17*
