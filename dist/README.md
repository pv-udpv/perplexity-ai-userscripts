# Perplexity AI Userscripts - Built Files

This directory contains ready-to-install userscripts for enhancing Perplexity AI.

## Available Scripts

### 1. ViteMonkey Built (`vitemonkey-built.user.js`)
A comprehensive template demonstrating best practices for Perplexity AI userscripts.

**Features:**
- Advanced logging system with multiple log levels
- Configuration management using GM storage
- Waits for Perplexity UI before initializing
- Keyboard shortcut: `Ctrl+Shift+D` to toggle debug mode
- Visual status button at bottom-right
- Event listeners for Perplexity interactions
- Automatic cleanup on page unload

**Size:** 3.6 KB (minified)  
**Grants:** GM_setValue, GM_getValue, GM_xmlhttpRequest  
**Run at:** document-start

### 2. Just Written (`just-written.user.js`)
A simple, lightweight example showing basic userscript capabilities.

**Features:**
- Message monitoring using MutationObserver
- Keyboard shortcuts:
  - `Ctrl+Shift+M`: Toggle message monitoring
  - `Ctrl+Shift+C`: Clear message count
- Visual status indicator at top-right
- Click indicator to toggle active/paused state
- Console logging with `[just-written]` prefix

**Size:** 2.3 KB (minified)  
**Grants:** None (uses only standard DOM APIs)  
**Run at:** document-idle

## Installation

1. **Install a userscript manager:**
   - [Tampermonkey](https://www.tampermonkey.net/) (recommended)
   - [Violentmonkey](https://violentmonkey.github.io/)

2. **Install a script:**
   - Click on the `.user.js` file you want to install
   - Your userscript manager will detect it and prompt to install
   - Click "Install" to confirm

3. **Visit Perplexity AI:**
   - Navigate to [perplexity.ai](https://www.perplexity.ai)
   - The script will automatically activate
   - Look for the visual indicators (buttons) on the page

## Usage

### ViteMonkey Built
- The blue button at the bottom-right indicates the script is active
- Click it to see interaction feedback
- Press `Ctrl+Shift+D` to toggle debug mode (check browser console)

### Just Written
- The green indicator at top-right shows the message count
- Click it to pause/resume monitoring (turns red when paused)
- Press `Ctrl+Shift+M` to toggle monitoring
- Press `Ctrl+Shift+C` to reset the message counter

## Troubleshooting

**Script doesn't appear:**
- Make sure you're on perplexity.ai
- Check that the script is enabled in your userscript manager
- Try refreshing the page

**No visual indicators:**
- Open browser console (F12) to check for errors
- Verify the script loaded successfully in your userscript manager

**Debug mode:**
- Enable debug mode in ViteMonkey Built (`Ctrl+Shift+D`)
- Check console for detailed logs

## Development

These scripts are built from TypeScript source in the `scripts/` directory.

To rebuild:
```bash
npm install
npm run build
```

For more information, see the main README.md in the repository root.
