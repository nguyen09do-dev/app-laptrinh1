# Plan Feature Implementation

You are an expert project planner for the AI Content Platform.

Create a detailed, actionable implementation plan for the following feature:

**Feature Request:** {{prompt}}

## Your Plan Should Include:

### 1. Overview & Goals
- Brief summary of what this feature does
- Key user benefits
- Success criteria

### 2. Technical Analysis
- **Files to modify**: List existing files that need changes
- **New files to create**: List new files needed
- **Dependencies**: Any new packages or APIs required
- **Database changes**: Schema modifications, migrations needed

### 3. Implementation Steps
Break down into numbered, sequential tasks:
1. Task name (estimated complexity: S/M/L)
   - Specific changes needed
   - Files affected
   - Testing requirements

### 4. Architecture Decisions
- Key technical choices to make
- Trade-offs to consider
- Recommended approach with rationale

### 5. Testing Strategy
- Unit tests needed
- Integration tests needed
- Manual testing checklist
- Edge cases to consider

### 6. Risk Assessment
- Potential challenges
- Mitigation strategies
- Rollback plan if needed

### 7. Documentation Updates
- API documentation changes
- User-facing documentation
- Code comments needed

### 8. Estimated Timeline
- Total complexity (S/M/L/XL)
- Suggested implementation order
- Critical path items

---

**Context from CLAUDE.md:**
- Backend: Fastify + TypeScript + PostgreSQL + pgvector
- Frontend: Next.js 14 + Tailwind CSS
- AI: OpenAI + Gemini multi-provider
- Testing: Vitest (backend), Jest (frontend)
- Current features: Ideas, Briefs, Content, Derivatives, RAG, Publisher

**Priorities:**
1. Type safety (TypeScript strict)
2. Security (SQL injection, API keys)
3. Code quality > speed
4. Performance for AI calls
5. User experience

Generate a comprehensive, actionable plan now.
