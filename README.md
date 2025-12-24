# Perplexity AI Userscripts

A curated collection of open-source userscripts for enhancing [Perplexity AI](https://www.perplexity.ai) productivity and user experience.

🚀 **Built with**: ViteMonkey + TypeScript + Modern DOM API  
🔧 **Compatible**: Tampermonkey, Violentmonkey (Chrome, Firefox, Safari)  
📦 **Package Manager**: npm (or `uv pip` for Python-based builds)  

---

## 📖 Complete Documentation

### 👤 For Users
- **[INSTALLATION.md](./INSTALLATION.md)** - Complete guide to installing, updating, and troubleshooting userscripts

### 👨‍💻 For Developers  
- **[PLUGIN_DEVELOPMENT_GUIDE.md](./PLUGIN_DEVELOPMENT_GUIDE.md)** - Comprehensive tutorial for creating plugins

### 📚 Additional Guides
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[RULES.md](./RULES.md)** - Code standards and conventions

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
| `vitemonkey-built` | [Coming soon] Template for ViteMonkey-based scripts | 🚧 Template |
| `just-written` | [Coming soon] Example script with modern TypeScript | 🚧 Example |

---

## 🚀 Quick Start

### For Users: Installing Scripts

**📖 [Complete Installation Guide](./INSTALLATION.md)** - Detailed instructions for end users

**Quick Install:**

1. **Install Userscript Manager** (if not already installed):
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Safari, Edge)
   - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox)

2. **Install a Script** from [Releases](https://github.com/pv-udpv/perplexity-ai-userscripts/releases):
   - Click on a `.user.js` file
   - Your userscript manager will prompt to install
   - Visit [perplexity.ai](https://www.perplexity.ai) to see it in action

3. **Updates**: Scripts auto-update via Tampermonkey (check daily by default)

---

## 🔨 Development

### For Developers: Creating Plugins

**📖 [Complete Plugin Development Guide](./PLUGIN_DEVELOPMENT_GUIDE.md)** - Comprehensive tutorial for developers

**Quick Start:**

```bash
# Clone repository
git clone https://github.com/pv-udpv/perplexity-ai-userscripts.git
cd perplexity-ai-userscripts

# Install dependencies
npm install

# Create new plugin
npm run scaffold my-plugin-name

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

**Your plugin will be at:** `dist/my-plugin-name.user.js`

### Project Structure

```
scripts/
├── shared/              # Shared utilities (storage, events, logger)
├── my-plugin/           # Your plugin
│   ├── index.ts         # Main entry point
│   ├── manifest.json    # Plugin metadata
│   ├── utils.ts         # Helper functions
│   ├── types.ts         # TypeScript types
│   └── __tests__/       # Unit tests
dist/                    # Compiled .user.js files
```

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

### For End Users
- **[INSTALLATION.md](./INSTALLATION.md)** - Complete guide to installing, updating, and troubleshooting userscripts
  - Installing userscript managers (Tampermonkey/Violentmonkey)
  - Installing and updating scripts
  - Troubleshooting common issues
  - FAQ for users

### For Developers
- **[PLUGIN_DEVELOPMENT_GUIDE.md](./PLUGIN_DEVELOPMENT_GUIDE.md)** - Comprehensive guide to creating plugins
  - Quick start tutorial
  - Plugin architecture overview
  - Using shared utilities (storage, events, logger)
  - Manifest configuration
  - Testing and debugging
  - Best practices and examples
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[RULES.md](./RULES.md)** - Project standards and conventions

### Additional Resources
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history
- **[TIER1_IMPLEMENTATION_GUIDE.md](./TIER1_IMPLEMENTATION_GUIDE.md)** - Shared modules implementation
- **.copilot-instructions.md** - AI assistant guidelines

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
