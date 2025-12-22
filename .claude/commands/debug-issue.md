# Debug Issue

You are an expert debugger for the AI Content Platform.

Help debug and resolve the following issue: **{{prompt}}**

## Debugging Process:

### 1. 🔍 Understand the Problem

**Gather Information:**
- What is the expected behavior?
- What is the actual behavior?
- When did this start happening?
- Can you reproduce it consistently?
- What error messages are shown?
- What are the user steps to reproduce?

### 2. 📊 Analyze Recent Changes

**Check:**
- Recent commits (last 5-10)
- Recent deployments
- Configuration changes
- Dependency updates
- Environment variable changes

### 3. 🔎 Investigate Root Cause

**For Backend Issues:**
```typescript
// Check logs
console.error('Error details:', {
  error: error.message,
  stack: error.stack,
  input: sanitizedInput,
  timestamp: new Date().toISOString(),
});

// Check database queries
console.log('Query:', query, 'Params:', params);

// Check AI provider calls
console.log('AI Request:', {
  provider: currentProvider,
  model: model,
  tokenCount: prompt.length,
});
```

**For Frontend Issues:**
```typescript
// Check state
console.log('Component state:', state);

// Check API responses
console.log('API Response:', {
  status: response.status,
  data: data,
});

// Check props
console.log('Component props:', props);
```

**For Database Issues:**
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check locks
SELECT * FROM pg_locks WHERE NOT granted;

-- Check connections
SELECT count(*) FROM pg_stat_activity;
```

**For AI Provider Issues:**
- Check API key validity
- Check rate limits
- Check quota/billing
- Check model availability
- Check token limits
- Check provider status page

### 4. 🧪 Test Hypothesis

**Create minimal reproduction:**
```typescript
// Isolate the problem
async function reproduceBug() {
  // Minimal code to trigger the issue
  const result = await problematicFunction(testInput);
  console.log('Result:', result);
}
```

### 5. 🔧 Propose Solutions

For each potential solution:
1. **What to change**: Specific code changes
2. **Why it works**: Explanation of the fix
3. **Side effects**: Any risks or impacts
4. **Testing**: How to verify the fix

### 6. ✅ Verify the Fix

**Test checklist:**
- [ ] Original issue resolved
- [ ] No regressions introduced
- [ ] Edge cases handled
- [ ] Performance not degraded
- [ ] Error messages improved

---

## Common Issue Patterns:

### Issue: AI Generation Failing

**Possible Causes:**
1. Token limit exceeded
   - **Fix**: Increase max_tokens or split prompt
2. API key invalid/expired
   - **Fix**: Rotate API key
3. Rate limit hit
   - **Fix**: Implement exponential backoff
4. Model unavailable
   - **Fix**: Use fallback model

### Issue: Database Query Slow

**Possible Causes:**
1. Missing index
   - **Fix**: Add index on queried columns
2. N+1 queries
   - **Fix**: Use JOIN or batch queries
3. Large result set
   - **Fix**: Add pagination
4. Inefficient query
   - **Fix**: Optimize with EXPLAIN ANALYZE

### Issue: Frontend Not Updating

**Possible Causes:**
1. State not updating
   - **Fix**: Check setState logic
2. API call failing silently
   - **Fix**: Add error handling
3. Cache issue
   - **Fix**: Invalidate cache
4. Stale props
   - **Fix**: Check useEffect dependencies

### Issue: Integration Not Working

**Possible Causes:**
1. OAuth token expired
   - **Fix**: Implement token refresh
2. API endpoint changed
   - **Fix**: Update API calls
3. Rate limit hit
   - **Fix**: Implement queueing
4. Credentials invalid
   - **Fix**: Re-authenticate

---

## Debugging Tools:

### Backend:
```bash
# Check logs
docker logs backend-container

# Check database
psql $DATABASE_URL

# Test API endpoint
curl -X POST http://localhost:3001/api/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Profile performance
NODE_ENV=production node --prof server.js
```

### Frontend:
```bash
# Check build errors
npm run build

# Check console errors
# Open browser DevTools

# Check network requests
# Browser DevTools → Network tab

# React DevTools
# Check component state/props
```

### Database:
```sql
-- Find slow queries
SELECT * FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;

-- Check table sizes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

---

## Output Format:

### 🔍 Issue Analysis
Brief summary of the problem.

### 🎯 Root Cause
What's causing the issue (hypothesis).

### 🔧 Proposed Solution

**Option 1: [Quick Fix]**
```typescript
// Code changes
```
- **Pros**: Fast, minimal changes
- **Cons**: May not address root cause

**Option 2: [Comprehensive Fix]**
```typescript
// Code changes
```
- **Pros**: Addresses root cause
- **Cons**: More work, potential risks

### 🧪 Testing Plan
1. Test original issue resolved
2. Test edge cases
3. Test performance impact
4. Test no regressions

### 📝 Prevention
How to prevent this in the future:
- Add tests
- Add validation
- Add monitoring
- Update documentation

---

**Project Context:**
- Backend: Fastify + TypeScript + PostgreSQL + pgvector
- Frontend: Next.js 14 + Tailwind
- AI: OpenAI + Gemini multi-provider
- Common issues: Token limits, quota errors, SQL performance

Begin debugging now.
