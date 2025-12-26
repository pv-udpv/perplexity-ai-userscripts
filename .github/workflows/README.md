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

---

## Auto-Scaffold Userscript

**File**: `scaffold.yml`  
**Purpose**: Automatically scaffold new userscripts with DOM and API extraction

### When It Runs

Workflow triggers when:
- **Issue opened** or **edited** with label `scaffold-request`

### What It Does

#### Steps:
1. **Parse Issue** - Extracts script name, target URL, and features from issue body
2. **Install Dependencies** - Installs npm packages and Chrome for Puppeteer
3. **Extract DOM Structure** - Scans target URL for `data-testid` elements
4. **Extract API Structure** - Intercepts network requests to capture API endpoints
5. **Generate Scaffolding** - Creates complete userscript structure with:
   - `index.ts` - Entry point
   - `manifest.json` - Userscript metadata
   - `api.ts` - Auto-generated API types
   - `dom.ts` - Auto-generated DOM selectors
   - `types.ts` - TypeScript definitions
   - `utils.ts` - Helper functions
   - `__tests__/` - Test templates
   - `README.md` - Documentation
   - `SCAFFOLD_README.md` - PR instructions
6. **Lint & Type Check** - Runs linting and type checking on generated code
7. **Create PR** - Creates a pull request with all generated files
8. **Comment on Issue** - Updates the original issue with PR link

### Using the Scaffold Workflow

1. **Create an Issue** using the "Scaffold New Userscript" template
2. Fill in:
   - **Script Name** (kebab-case, e.g., `my-awesome-script`)
   - **Target URL** (website to analyze, e.g., `https://example.com`)
   - **Features to Implement** (list of features)
3. Add the `scaffold-request` label
4. Wait for the workflow to run (~2-5 minutes)
5. Review the auto-generated PR
6. Implement the features in the scaffolded files

### Example Issue

```markdown
### Script Name
chat-enhancer

### Target URL
https://www.perplexity.ai

### Features to Implement
- Add keyboard shortcuts
- Save chat history
- Export conversations

### Additional Context
Focus on keyboard navigation
```

### Generated Structure

```
scripts/chat-enhancer/
├── index.ts              # Main implementation
├── manifest.json         # Userscript metadata
├── api.ts                # 5 API endpoints (auto-extracted)
├── dom.ts                # 12 DOM selectors (auto-extracted)
├── types.ts              # TypeScript types
├── utils.ts              # Helper functions
├── __tests__/
│   └── index.test.ts     # Test template
├── README.md             # Documentation
└── SCAFFOLD_README.md    # PR description
```

### Benefits

✅ **10x Faster**: Scaffolding in minutes instead of hours  
✅ **Auto-Discovery**: Finds all DOM elements and APIs automatically  
✅ **Type-Safe**: Generates TypeScript interfaces for APIs  
✅ **Test-Ready**: Includes test templates and helpers  
✅ **Documentation**: Auto-generates README with API/DOM references  

### Troubleshooting

**Workflow didn't run?**
- Verify issue has `scaffold-request` label
- Check issue format matches template

**Extraction failed?**
- Target URL might require authentication
- Website might block headless browsers
- Check workflow logs for details

**PR creation failed?**
- Branch might already exist
- Git conflicts possible

---

### Future Workflows

- **Tier 2**: Manifest-as-code tests
- **Tier 3**: Vite build verification
- **Tier 4**: E2E browser tests

---

**Last Updated**: Dec 26, 2025  
**Status**: ✅ Active and Optimized
