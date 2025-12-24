# Perplexity AI Userscripts

A curated collection of open-source userscripts for enhancing [Perplexity AI](https://www.perplexity.ai) productivity and user experience.

🚀 **Built with**: ViteMonkey + TypeScript + Modern DOM API  
🔧 **Compatible**: Tampermonkey, Violentmonkey (Chrome, Firefox, Safari)  
📦 **Package Manager**: npm (or `uv pip` for Python-based builds)  

---

## 🎯 Overview

This repository provides high-quality, well-tested userscripts that extend Perplexity AI functionality:

- **Enhanced UI**: Keyboard shortcuts, custom themes, layout tweaks
- **Productivity**: Chat history search, response export, session management
- **Automation**: Scheduled queries, batch processing, auto-refresh
- **Integration**: External tools, API connectors, data sync

---

## 📦 Scripts

| Script | Description | Status |
|--------|-------------|--------|
| `github-auto-approve` | Auto-approve GitHub operations based on configurable rules | ✅ Active |
| `vitemonkey-built` | [Coming soon] Template for ViteMonkey-based scripts | 🚧 Template |
| `just-written` | [Coming soon] Example script with modern TypeScript | 🚧 Example |

### GitHub Auto-Approve

**Features:**
- 🎯 Repository whitelisting with wildcards (`owner/*`, `*`)
- ⏱️ Configurable countdown timer with visual feedback
- 🎨 Beautiful gradient UI overlay
- ⚙️ Config panel (Ctrl+Shift+G)
- 📝 Audit logging to console
- 🔒 Operation type filtering (create, update, delete)
- 📂 File path pattern matching

**Quick Start:**
1. Install the userscript from `/dist/perplexity-ai-userscripts.user.js`
2. Open Perplexity AI
3. Press `Ctrl+Shift+G` to open configuration
4. Add your repository rules
5. GitHub operations will auto-approve based on your rules

**Example Configuration:**
```json
{
  "enabled": true,
  "defaultDelay": 5,
  "rules": [
    {
      "repoPattern": "pv-udpv/*",
      "operations": ["create", "update"],
      "delay": 3,
      "autoApprove": true
    }
  ]
}
```

**Security:**
- Delete operations require explicit whitelisting
- Visual countdown allows cancellation
- All actions logged to console for audit trail

---

## 🚀 Quick Start

### Installation

1. **Install Userscript Manager** (if not already installed):
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Safari, Edge)
   - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox)

2. **Install a Script** from `/dist/`:
   - Download `.user.js` file from releases or `/dist/` folder
   - Click to install in your userscript manager
   - Script is now active on perplexity.ai

### Example
```bash
# Visit and install dist/vitemonkey-built.user.js
# Script auto-updates from GitHub (if configured)
```

---

## 🔨 Development

### Prerequisites
```bash
Node.js 18+ (or Python 3.9+ with uv)
npm install -g npm@latest
```

### Setup
```bash
# Clone repository
git clone https://github.com/pv-udpv/perplexity-ai-userscripts.git
cd perplexity-ai-userscripts

# Install dependencies
npm install

# Build all scripts
npm run build

# Watch mode for development
npm run build:watch

# Run tests
npm run test

# Lint & format
npm run lint
npm run format
```

### Creating a New Script
```bash
npm run scaffold my-awesome-script
```

This creates a new script in `scripts/my-awesome-script/` with:
- `index.ts` - Main logic
- `manifest.json` - Metadata
- `utils.ts` - Helper functions
- `__tests__/` - Unit tests

### Testing Locally
1. Run `npm run build`
2. Open `dist/script-name.user.js` in text editor
3. Copy content to new Tampermonkey script
4. Test on [perplexity.ai](https://www.perplexity.ai)
5. Use browser DevTools for debugging

---

## 📋 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before starting.

### Contribution Steps
1. Fork the repository
2. Create feature branch: `git checkout -b feat/awesome-feature`
3. Develop & test locally
4. Commit with conventional messages: `feat: add awesome feature`
5. Push & open PR with test results
6. Maintainer reviews & merges

### Code Style
- **TypeScript**: Strict mode, ESLint, Prettier
- **Testing**: Vitest, >80% coverage for new features
- **Documentation**: JSDoc comments, README per script
- **Commits**: Conventional format (feat, fix, docs, refactor)

See [RULES.md](./RULES.md) for complete guidelines.

---

## 📚 Documentation

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute
- **[RULES.md](./RULES.md)** - Project standards & conventions
- **.copilot-instructions.md** - AI assistant guidelines
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history (coming soon)

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|----------|
| **Vite + ViteMonkey** | Fast build, userscript bundling |
| **TypeScript 5+** | Type-safe development |
| **Vitest** | Unit testing |
| **ESLint + Prettier** | Code quality & formatting |
| **Tampermonkey API** | Storage, HTTP, utilities |
| **GitHub Actions** | CI/CD automation (planned) |

---

## 🔐 Security & Privacy

- ✅ No hardcoded credentials
- ✅ No external CDN dependencies (bundled only)
- ✅ XSS prevention (textContent, not innerHTML)
- ✅ Respects Perplexity TOS
- ✅ Open source for community review

---

## 📞 Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/pv-udpv/perplexity-ai-userscripts/issues)
- 💡 **Feature Requests**: [Discussions](https://github.com/pv-udpv/perplexity-ai-userscripts/discussions)
- 💬 **Questions**: Ask in [Issues](https://github.com/pv-udpv/perplexity-ai-userscripts/issues) with `[question]` label

---

## 📄 License

MIT License – see [LICENSE](./LICENSE) for details.

Feel free to fork, modify, and distribute these userscripts.

---

## 🙏 Acknowledgments

- [Perplexity AI](https://www.perplexity.ai) – Amazing search & research platform
- [ViteMonkey](https://github.com/lisongedu/vite-plugin-monkey) – Modern userscript bundler
- [Tampermonkey](https://www.tampermonkey.net/) – Userscript manager
- Community contributors

---

## 🗺️ Roadmap

- [ ] Script 1: ViteMonkey template with examples
- [ ] Script 2: Example productivity script
- [ ] Auto-update system via GitHub releases
- [ ] Community script directory
- [ ] GitHub Actions CI/CD pipeline
- [ ] Distribution via Greasy Fork (optional)

---

**Last updated**: December 2025  
**Author**: [pv-udpv](https://github.com/pv-udpv)
