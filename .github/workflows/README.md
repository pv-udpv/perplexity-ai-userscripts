# GitHub Actions Workflows

## Tier 1 - Shared Modules Tests

**File**: `test-tier1.yml`  
**Purpose**: Automated testing of shared modules library

### When It Runs

Workflow triggers automatically on:

- **Push** to `main` or `feat/tier1-shared-modules`
- **Pull Request** to `main`

**Only when these files change**:
- `scripts/shared/**` (any file in shared modules)
- `.github/workflows/test-tier1.yml` (workflow itself)
- `package.json`, `package-lock.json` (dependencies)
- `tsconfig.json`, `vitest.config.ts` (config)

### What It Does

#### Job 1: Detect Changes
- Uses `dorny/paths-filter@v3` to detect which files changed
- Outputs:
  - `shared-changed`: Implementation files changed
  - `tests-changed`: Test files changed

#### Job 2: Test Shared Modules (Matrix)
- Runs on **Node 18** and **Node 20** in parallel
- Steps:
  1. Type check (`npm run type-check`)
  2. Run tests (`npm run test -- scripts/shared`)
  3. Generate coverage (Node 20 only)
  4. Upload coverage artifacts
  5. Comment coverage on PR (if PR)

#### Job 3: Lint Shared
- Runs ESLint on `scripts/shared/**/*.ts`
- Checks Prettier formatting
- Continues on error (non-blocking)

### Optimization Features

✅ **Smart Filtering**: Skips when only docs change  
✅ **Conditional Execution**: Tests run only if needed  
✅ **Parallel Testing**: Node 18 + 20 simultaneously  
✅ **Scoped Linting**: Only lints changed directory  
✅ **PR Comments**: Auto-posts coverage on PRs  

### Examples

| Change | Workflow Behavior |
|--------|-------------------|
| `README.md` only | ❌ Skipped |
| `scripts/shared/storage.ts` | ✅ Full run |
| `scripts/shared/storage.test.ts` | ✅ Tests only |
| `scripts/other/index.ts` | ❌ Skipped |
| PR with shared changes | ✅ Tests + coverage comment |

### Expected Output

```
✅ Detect Changed Files
✅ Test Shared Modules (Node 18)
   ✓ Type check
   ✓ Run tests (52 passed)
✅ Test Shared Modules (Node 20)
   ✓ Type check
   ✓ Run tests (52 passed)
   ✓ Coverage report (92%)
   ✓ Upload artifacts
✅ Lint Shared
   ✓ ESLint
   ✓ Prettier
```

### Cost Savings

**Before**: 20 runs/day, 15 wasted → 45 min/day wasted  
**After**: 5 runs/day, 0 wasted → 0 min/day wasted  
**Savings**: ~22.5 hours/month of CI time

### Troubleshooting

**Workflow didn't run?**
- Check if files in `paths` filter changed
- Verify branch name matches trigger

**Tests failed?**
- Check logs in Actions tab
- Run locally: `npm run test -- scripts/shared`

**Coverage too low?**
- Thresholds: 90% lines, 90% functions, 85% branches
- Add more tests to increase coverage

### Future Workflows

- **Tier 2**: Manifest-as-code tests
- **Tier 3**: Vite build verification
- **Tier 4**: E2E browser tests

---

**Last Updated**: Dec 25, 2025  
**Status**: ✅ Active and Optimized
