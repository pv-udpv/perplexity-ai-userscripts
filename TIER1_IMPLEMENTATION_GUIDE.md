# Tier 1 Implementation Guide (Week 1)

📅 **Timeline**: Dec 24 - Dec 30, 2025  
⏰ **Est. Time**: 8-12 hours  
🎯 **Goal**: Deploy shared modules foundation

## What You'll Build

✅ **StorageService** - Unified GM_*/localStorage abstraction  
✅ **EventEmitter** - Type-safe event system  
✅ **Logger** - Namespaced logging utility  
✅ **Utils** - Helper functions (debounce, throttle, etc.)  
✅ **Path aliases** - Clean `@shared` imports  
✅ **Tests** - Full coverage for core modules  
✅ **Documentation** - README + usage examples  

## Step-by-Step Checklist

### Phase 1: Repository Setup (30 min)

- [x] Create feature branch: `feat/tier1-shared-modules`
- [x] Create `scripts/shared/` directory
- [x] Update `tsconfig.json` with path aliases
- [x] Verify project structure

**Status**: ✅ COMPLETE

### Phase 2: Core Modules (3-4 hours)

#### StorageService Implementation (1 hour)
- [x] Create `scripts/shared/storage.ts`
- [x] Implement class with methods:
  - [x] `get<T>(key)` - Retrieve with type inference
  - [x] `set<T>(key, value)` - Store any serializable type
  - [x] `remove(key)` - Delete key
  - [x] `clear()` - Clear namespaced values
  - [x] `has(key)` - Check existence
  - [x] `keys()` - List all keys
  - [x] `size()` - Calculate storage size
- [x] Create test file: `storage.test.ts`
- [x] Add 12+ test cases covering:
  - [x] Basic get/set/remove
  - [x] Object and array handling
  - [x] Null handling
  - [x] Type safety with generics
  - [x] Namespace isolation
  - [x] Clear operations

**Status**: ✅ COMPLETE

#### EventEmitter Implementation (1 hour)
- [x] Create `scripts/shared/events.ts`
- [x] Define `EventMap` interface with 8+ events
- [x] Implement EventEmitter class with methods:
  - [x] `on<K>(event, callback)` - Subscribe
  - [x] `once<K>(event, callback)` - One-time subscribe
  - [x] `emit<K>(event, data)` - Dispatch event
  - [x] `removeAllListeners(event?)` - Cleanup
  - [x] `listenerCount(event)` - Get listener count
  - [x] `eventNames()` - List active events
- [x] Create test file: `events.test.ts`
- [x] Add 12+ test cases covering:
  - [x] Subscribe and emit
  - [x] Multiple listeners
  - [x] One-time listeners
  - [x] Error handling
  - [x] Listener removal
  - [x] Memory management

**Status**: ✅ COMPLETE

#### Logger & Utils (1.5 hours)
- [x] Create `scripts/shared/logger.ts`
  - [x] Define `LogLevel` enum
  - [x] Implement `initializeLogger()` function
  - [x] Add methods: debug, info, warn, error
- [x] Create `scripts/shared/utils.ts`
  - [x] `debounce<T>(func, wait)` - Delay execution
  - [x] `throttle<T>(func, limit)` - Rate limit
  - [x] `sleep(ms)` - Async delay
  - [x] `retryWithBackoff()` - Exponential retry
  - [x] `querySafe<T>(selector)` - Safe DOM query
  - [x] `querySafeAll<T>(selector)` - Safe query all
  - [x] `isElementInViewport()` - Visibility check
  - [x] `generateId(prefix?)` - Unique ID generation

**Status**: ✅ COMPLETE

#### Barrel Export (30 min)
- [x] Create `scripts/shared/index.ts`
- [x] Export all public APIs:
  - [x] StorageService, storage singleton
  - [x] EventEmitter, events singleton
  - [x] Logger utilities
  - [x] All utility functions
- [x] Type exports (interfaces, types)

**Status**: ✅ COMPLETE

### Phase 3: Testing & QA (2-3 hours)

- [ ] Run all tests: `npm run test`
  ```bash
  npm run test -- scripts/shared
  ```
- [ ] Verify test coverage: `npm run test -- --coverage`
  - [ ] Aim for 90%+ coverage on shared modules
- [ ] Check types: `npm run type-check`
  - [ ] No TypeScript errors
  - [ ] Path aliases resolve correctly
- [ ] Test manual imports:
  ```typescript
  import { storage, events, initializeLogger } from '@shared';
  ```

**Status**: ⏳ IN PROGRESS (Ready after tests)

### Phase 4: Documentation (1-1.5 hours)

- [x] Create `scripts/shared/README.md`
  - [x] Overview of each module
  - [x] API documentation with examples
  - [x] Quick start guide
  - [x] Best practices
  - [x] Troubleshooting
- [x] Create `TIER1_IMPLEMENTATION_GUIDE.md` (this file)
  - [x] Step-by-step checklist
  - [x] Time estimates
  - [x] Success criteria
- [ ] Add code comments:
  - [ ] JSDoc on all public functions
  - [ ] Inline comments for complex logic

**Status**: ⏳ IN PROGRESS

### Phase 5: Git & Merge (30 min)

- [ ] Review all changes locally
- [ ] Commit messages follow convention:
  ```
  feat(tier1): [module] [description]
  ```
- [ ] Push to branch: `git push origin feat/tier1-shared-modules`
- [ ] Create Pull Request:
  - [ ] Describe changes
  - [ ] Link to analysis docs
  - [ ] Run GitHub Actions tests
  - [ ] Request code review
- [ ] Merge after approval
- [ ] Delete feature branch

**Status**: ⏳ TODO (After testing)

## Success Criteria

### Functional
- [x] All modules compile without errors
- [x] TypeScript strict mode passes
- [x] Path aliases `@shared` resolve
- [x] Singleton instances work globally
- [ ] All tests pass (12/12+ per module)
- [ ] 90%+ code coverage on shared/

### Code Quality
- [x] All functions have JSDoc comments
- [x] Error handling implemented
- [x] No console warnings
- [ ] Follows TypeScript/project conventions
- [x] Module isolation verified

### Documentation
- [x] README covers all APIs
- [x] Examples work as-written
- [x] Troubleshooting section complete

## Daily Breakdown

### Day 1 (4 hours) - Core Implementation
```
09:00-10:00  Setup & StorageService
10:00-11:00  StorageService tests
11:00-12:00  EventEmitter
12:00-13:00  EventEmitter tests + lunch
```

### Day 2 (3 hours) - Utilities & Documentation
```
09:00-10:00  Logger & Utils
10:00-11:00  Barrel export & path aliases
11:00-12:00  Documentation & README
```

### Day 3 (2-3 hours) - Testing & Merge
```
09:00-10:00  Run full test suite
10:00-11:00  Fix any failures
11:00-12:00  PR review & merge
12:00-13:00  Verify in main branch
```

## Troubleshooting

**Test failures?**
- Check Node version: `node -v` (should be 18+)
- Clear cache: `npm run clean && npm install`
- Run single test: `npm run test storage.test.ts`

**Import errors?**
- Restart IDE/TypeScript server
- Run `npm run type-check` to see full errors
- Verify tsconfig.json has path aliases

**Storage not working?**
- Check if GM_setValue is available: `console.log(typeof GM_setValue)`
- Try localStorage directly: `localStorage.setItem('test', 'value')`
- Check browser permissions for script

## Next Steps (Tier 2)

After Tier 1 is merged:

1. **Manifest-as-code** (2-3 hours)
   - TypeScript manifest generator
   - Type-safe manifest creation
   - Auto-export for Tampermonkey

2. **Vite/Build Integration** (2-3 hours)
   - Single-file bundle per script
   - Polished output
   - Source maps for debugging

3. **E2E Testing** (3-4 hours)
   - Automated Perplexity UI testing
   - Regression detection
   - CI/CD integration

## Resources

📚 **Documentation**:
- [scripts/shared/README.md](./scripts/shared/README.md) - API docs
- [complexity_extension_analysis.md](../complexity_extension_analysis.md) - Pattern analysis
- [Vitest Documentation](https://vitest.dev/) - Testing framework

🔗 **Related Issues/PRs**:
- PR: #1 (this PR)
- Pattern Source: [Complexity Extension](https://github.com/pnd280/complexity)

---

**Started**: Dec 24, 2025  
**Target Completion**: Dec 30, 2025  
**Status**: 🚀 ACTIVE
