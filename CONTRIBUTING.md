# Contributing to perplexity-ai-userscripts

Thank you for your interest in contributing! This guide will help you get started.

## 📚 Documentation

Before contributing, please read:
- **[PLUGIN_DEVELOPMENT_GUIDE.md](./PLUGIN_DEVELOPMENT_GUIDE.md)** - Complete guide to creating plugins
- **[INSTALLATION.md](./INSTALLATION.md)** - For testing your changes as an end user
- **[RULES.md](./RULES.md)** - Code standards and conventions

## Code of Conduct
- Be respectful and constructive
- Focus on improving Perplexity AI user experience
- No harassment, spam, or promotional content
- Respect Perplexity's Terms of Service

## Getting Started

### Prerequisites
- Node.js 18+ or Python 3.9+ with `uv`
- Git
- Tampermonkey/Violentmonkey browser extension
- VSCode (recommended)

### Setup
```bash
# Clone repository
git clone https://github.com/pv-udpv/perplexity-ai-userscripts.git
cd perplexity-ai-userscripts

# Install dependencies
npm install
# or
uv pip install -r requirements.txt

# Create feature branch
git checkout -b feat/your-feature-name
```

## Development

### Creating a New Userscript
```bash
npm run scaffold my-script-name
```

This creates:
```
scripts/my-script-name/
├── index.ts          # Main logic
├── manifest.json     # Userscript metadata
├── utils.ts          # Helper functions
└── __tests__/        # Unit tests
```

### Building
```bash
npm run build          # Build all scripts
npm run build:watch   # Watch mode for development
```

Output lands in `dist/` with proper userscript headers.

### Testing Locally
1. Open `dist/script-name.user.js` in text editor
2. Copy full content
3. In Tampermonkey dashboard, create new script
4. Paste content, save, test on perplexity.ai
5. Use browser DevTools console for debugging

### Testing Framework
```bash
npm run test          # Run Vitest
npm run test:watch   # Watch mode
```

Write tests in `scripts/<script-name>/__tests__/`:
```typescript
describe('myScript', () => {
  it('should do X', () => {
    expect(myFunction()).toBe(expected);
  });
});
```

### Linting & Formatting
```bash
npm run lint          # Check
npm run lint:fix      # Auto-fix
npm run format        # Prettier
```

## Submitting Changes

### Before Opening PR
1. **Test thoroughly**
   - Works on latest Perplexity AI (check if site structure changed)
   - No console errors
   - Performance acceptable (DevTools profiler)
   - Compatible with Tampermonkey + Violentmonkey

2. **Code quality**
   - `npm run lint` passes
   - `npm run test` passes
   - TypeScript strict mode: `tsc --noEmit`
   - No dead code, comments for complex logic

3. **Documentation**
   - Update CHANGELOG.md
   - Add script description in README
   - Include usage example if applicable
   - Document any new configuration options

4. **Security**
   - No hardcoded credentials
   - Validate/sanitize any user input
   - Check for XSS vulnerabilities (esp. innerHTML)
   - Don't make unauthorized API calls

### PR Title Format
```
feat: add keyboard shortcuts for quick actions
fix: resolve DOM selector timing issue
refactor: simplify response parser logic
docs: update configuration examples
chore: upgrade ViteMonkey to 1.x
```

### PR Description Template
```markdown
## What does this PR do?
Brief description of the change.

## Why?
Context and motivation.

## Testing
- [ ] Tested on latest Perplexity AI
- [ ] No console errors
- [ ] Works in Tampermonkey and Violentmonkey
- [ ] Performance verified (screenshots if significant impact)

## Screenshots/GIF
[Add demo if UI-related]

## Checklist
- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Docs updated
- [ ] No breaking changes
```

## Issues & Feature Requests

### Reporting a Bug
```markdown
## Bug: [Short description]

**Environment**
- Browser: Chrome/Firefox version
- Userscript manager: Tampermonkey/Violentmonkey version
- Script version: x.y.z
- Perplexity UI: Free/Pro (if relevant)

**Steps to Reproduce**
1. Open Perplexity AI
2. Do X
3. Observe Y (unexpected behavior)

**Expected Behavior**
What should happen instead.

**Actual Behavior**
What actually happens, error messages, console logs.

**Additional Context**
Screenshots, browser console output, etc.
```

### Requesting a Feature
```markdown
## Feature Request: [Short title]

**Problem Statement**
What problem does this solve for Perplexity users?

**Proposed Solution**
How should this work? User flow, UI changes, etc.

**Alternatives**
Other approaches considered.

**Additional Context**
Examples, research, related scripts.
```

## Review Process
1. Maintainer checks code quality, tests, docs
2. Feedback provided (may request changes)
3. After approval, PR is merged
4. Script version bumped, CHANGELOG updated
5. New release published with dist files

## Release Process
1. Update `package.json` version
2. Update `CHANGELOG.md`
3. Tag release: `git tag v1.0.0`
4. Push: `git push origin main --tags`
5. GitHub Actions auto-publishes dist files

## Questions?
- Open an issue with `[question]` label
- Check existing issues/discussions first
- Include relevant context and error messages

---

**Thank you for contributing!** 🚀
