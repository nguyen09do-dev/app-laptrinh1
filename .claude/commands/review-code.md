# Code Review

You are an expert code reviewer for the AI Content Platform.

Perform a comprehensive code review of: **{{prompt}}**

## Review Checklist:

### 1. ✅ Type Safety
- [ ] No `any` types used
- [ ] Explicit return types on functions
- [ ] Proper interface definitions
- [ ] Type guards where needed

### 2. 🔒 Security
- [ ] SQL queries are parameterized (no string concatenation)
- [ ] No API keys or secrets in code
- [ ] Input validation with AJV schemas (backend)
- [ ] XSS prevention (proper escaping)
- [ ] CSRF protection where applicable
- [ ] Authentication/authorization checks

### 3. 🐛 Error Handling
- [ ] Try-catch blocks for async operations
- [ ] Meaningful error messages
- [ ] No empty catch blocks
- [ ] Errors logged appropriately
- [ ] User-facing errors are helpful

### 4. 📊 Performance
- [ ] No N+1 database queries
- [ ] Efficient vector searches (if applicable)
- [ ] AI token usage optimized
- [ ] No unnecessary re-renders (React)
- [ ] Proper use of indexes (database)

### 5. 🎨 Code Quality
- [ ] Follows project conventions (see CLAUDE.md)
- [ ] Functions are small and focused (<50 lines)
- [ ] Clear variable and function names
- [ ] No code duplication
- [ ] Proper separation of concerns (Controller/Service pattern)

### 6. 📝 Documentation
- [ ] JSDoc comments for public functions
- [ ] Complex logic has explanatory comments
- [ ] README updated if needed
- [ ] API documentation current

### 7. 🧪 Testing
- [ ] Unit tests exist for new functionality
- [ ] Edge cases covered
- [ ] Mocks used appropriately
- [ ] Test names are descriptive

### 8. 🏗️ Architecture
- [ ] Follows existing patterns
- [ ] Proper use of abstraction layers
- [ ] No tight coupling
- [ ] Scalable design

---

## Review Format:

### Summary
Brief overview of what this code does.

### Strengths ✅
- What's done well
- Good practices observed

### Issues Found 🚨

#### Critical (Must Fix):
- Security vulnerabilities
- Type safety violations
- SQL injection risks

#### Major (Should Fix):
- Performance problems
- Error handling gaps
- Code quality issues

#### Minor (Nice to Have):
- Style improvements
- Documentation additions
- Refactoring opportunities

### Specific Recommendations:

For each issue, provide:
1. **Location**: File and line number
2. **Problem**: What's wrong
3. **Fix**: Exact code to use
4. **Why**: Explanation

### Example:

**Location**: `backend/src/services/ideas.service.ts:45`

**Problem**:
```typescript
const query = `SELECT * FROM ideas WHERE user_id = ${userId}`;
```

**Fix**:
```typescript
const query = 'SELECT * FROM ideas WHERE user_id = $1';
const result = await db.query(query, [userId]);
```

**Why**: Prevents SQL injection attacks. Always use parameterized queries.

---

### Overall Assessment:
- **Security**: [Pass/Fail]
- **Type Safety**: [Pass/Fail]
- **Code Quality**: [1-5 stars]
- **Ready to Merge**: [Yes/No]

### Next Steps:
1. Fix critical issues first
2. Address major issues
3. Consider minor improvements
4. Re-review if needed

---

**Project Context:**
- Backend: Fastify + TypeScript + PostgreSQL
- Frontend: Next.js 14 + Tailwind
- See CLAUDE.md for full conventions

Begin your review now.
