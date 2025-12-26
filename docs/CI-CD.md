# CI/CD Pipeline Documentation

## Overview

This project uses GitHub Actions to automate testing, building, quality checks, and releases. The pipeline ensures every commit and PR meets quality standards before merging.

## Workflows

### 1. **Lint & Test** (`lint-and-test.yml`)
Runs on every push and PR to `main`/`develop`.

**Jobs:**
- **Lint**: Runs ESLint and TypeScript type checking
- **Test**: Runs unit tests with coverage reporting
- **Build**: Builds production assets

**Triggers:**
```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

**Example Output:**
```
✓ Lint Code (lint-and-test.yml)
✓ Unit Tests (lint-and-test.yml)
✓ Build (lint-and-test.yml)
```

---

### 2. **Quality Gates** (`quality-gates.yml`)
Enforces quality standards on every PR and push to `main`.

**Jobs:**
- **Security**: `npm audit` for vulnerabilities
- **Coverage**: Ensures test coverage ≥80%
- **Bundle Size**: Validates `.user.js` sizes
- **PR Comment**: Posts quality report as PR comment

**Requirements to Merge:**
```
✅ No high/moderate vulnerabilities
✅ Coverage ≥ 80%
✅ Bundle size < 100KB (raw)
✅ All lint/test checks pass
```

**Example PR Comment:**
```markdown
## 📊 Quality Report

| Check | Status |
|-------|--------|
| 🔒 Security | ✅ |
| 📈 Coverage | 85% |
| 📦 Bundle Size | ✅ |
| ✨ Lint | ✅ |
```

---

### 3. **Auto Release** (`auto-release.yml`)
Automatically creates GitHub releases when version is bumped.

**Triggers:**
```yaml
on:
  push:
    branches: [main]
    paths:
      - 'package.json'  # When version changes
      - 'scripts/**'     # When scripts change
      - 'src/**'         # When source changes
```

**What it does:**
1. Detects new version in `package.json`
2. Builds production assets
3. Creates GitHub Release with tag `v{version}`
4. Includes dist artifacts in release notes

**Example Release:**
```
Release v1.0.1

## Userscripts
- just-written.user.js
- vitemonkey-built.user.js  
- github-auto-approve.user.js

See Installation Guide for setup.
```

---

## Local Development

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
```

### Setup
```bash
# Clone repository
git clone https://github.com/pv-udpv/perplexity-ai-plug.git
cd perplexity-ai-plug

# Install dependencies
npm install

# Setup git hooks
npm run prepare
```

### Common Commands

**Development**
```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run build:watch   # Watch for changes
```

**Testing & Quality**
```bash
npm test              # Run tests in watch mode
npm run test:unit     # Run tests once
npm run test:coverage # Generate coverage report
npm run lint          # Check code style
npm run lint:fix      # Auto-fix style issues
npm run type-check    # Check TypeScript types
```

**CI Simulation**
```bash
# Run all CI checks locally
npm run ci

# This runs:
# 1. npm run lint
# 2. npm run type-check
# 3. npm run test:coverage
# 4. npm run build
```

---

## Pre-commit Hooks

When you commit, `husky` automatically runs `lint-staged` which:

1. **For TypeScript files** (`.ts`, `.tsx`):
   - Runs ESLint with auto-fix
   - Runs Prettier for formatting

2. **For Markdown files** (`.md`):
   - Runs Prettier

**Example:**
```bash
git add src/index.ts
git commit -m "feat: add new feature"

# Automatically runs:
# ✓ eslint --fix src/index.ts
# ✓ prettier --write src/index.ts
```

**Skip hooks** (not recommended):
```bash
git commit --no-verify
```

---

## Branch Protection Rules

Main branch (`main`) has protection that requires:

- ✅ All status checks pass (lint, test, build, security, coverage)
- ✅ At least 1 code review approval
- ✅ Branch up to date with base branch
- ✅ No bypasses for administrators

---

## Troubleshooting

### Build failures

**Issue**: `npm run build` fails locally
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Check TypeScript errors
npm run type-check

# Try building again
npm run build
```

### Test failures

**Issue**: Tests fail in CI but pass locally
**Solution**:
```bash
# Run tests exactly as CI does
npm run test:ci

# Check coverage
npm run test:coverage

# Look for coverage gaps
open coverage/index.html  # macOS/Linux
start coverage/index.html # Windows
```

### Lint errors

**Issue**: ESLint reports errors
**Solution**:
```bash
# Auto-fix automatically fixable errors
npm run lint:fix

# View remaining errors
npm run lint
```

### Coverage below threshold

**Issue**: Coverage is below 80%
**Solution**:
```bash
# Check coverage report
npm run test:coverage
open coverage/index.html

# Add tests for uncovered files
# Aim for >80% coverage
```

---

## Releases

Releases happen automatically when you:

1. Update version in `package.json`:
```json
{
  "version": "1.0.2"
}
```

2. Merge to `main`

3. GitHub Actions automatically:
   - Builds release artifacts
   - Creates GitHub Release
   - Tags commit with version

**Version format**: Semantic Versioning (`MAJOR.MINOR.PATCH`)

---

## Monitoring

### GitHub Actions Dashboard
View workflow runs: https://github.com/pv-udpv/perplexity-ai-plug/actions

### Codecov Integration
View coverage trends: https://codecov.io/gh/pv-udpv/perplexity-ai-plug

### Status Badges
Include in README:
```markdown
[![Lint & Test](https://github.com/pv-udpv/perplexity-ai-plug/actions/workflows/lint-and-test.yml/badge.svg)](https://github.com/pv-udpv/perplexity-ai-plug/actions)
[![Quality Gates](https://github.com/pv-udpv/perplexity-ai-plug/actions/workflows/quality-gates.yml/badge.svg)](https://github.com/pv-udpv/perplexity-ai-plug/actions)
```

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Vitest Documentation](https://vitest.dev/)
- [ESLint Documentation](https://eslint.org/)
