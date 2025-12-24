# Installation Guide

Complete guide for installing, updating, and managing Perplexity AI userscripts.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installing a Userscript Manager](#installing-a-userscript-manager)
- [Installing Userscripts](#installing-userscripts)
- [Updating Userscripts](#updating-userscripts)
- [Uninstalling Userscripts](#uninstalling-userscripts)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## Prerequisites

Before installing userscripts, you'll need:

- **Web Browser**: Chrome 90+, Firefox 88+, Safari 15+, or Edge 90+
- **Userscript Manager**: Tampermonkey or Violentmonkey browser extension
- **Internet Connection**: To download scripts and updates

---

## Installing a Userscript Manager

A userscript manager is a browser extension that allows you to install and run userscripts.

### Recommended: Tampermonkey

**For Chrome/Edge/Brave:**
1. Visit [Chrome Web Store - Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
2. Click "Add to Chrome" (or "Add to Edge/Brave")
3. Confirm by clicking "Add extension"
4. Tampermonkey icon appears in your browser toolbar

**For Firefox:**
1. Visit [Firefox Add-ons - Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
2. Click "Add to Firefox"
3. Confirm by clicking "Add"
4. Tampermonkey icon appears in your browser toolbar

**For Safari:**
1. Visit [Mac App Store - Tampermonkey](https://apps.apple.com/us/app/tampermonkey/id1482490089)
2. Install from the App Store
3. Enable the extension in Safari preferences
4. Tampermonkey icon appears in your browser toolbar

### Alternative: Violentmonkey

**For Chrome/Edge/Firefox:**
1. Visit [Violentmonkey website](https://violentmonkey.github.io/get-it/)
2. Click on your browser to go to the extension store
3. Click "Add to Browser"
4. Confirm installation

---

## Installing Userscripts

Once you have a userscript manager installed, you can add userscripts to enhance Perplexity AI.

### Method 1: Install from GitHub Releases (Recommended)

1. **Navigate to Releases:**
   - Go to [Releases page](https://github.com/pv-udpv/perplexity-ai-userscripts/releases)
   - Find the latest release

2. **Choose Your Script:**
   - Look for `.user.js` files in the Assets section
   - Example: `vitemonkey-built.user.js`

3. **Install:**
   - Click on the `.user.js` file
   - Your userscript manager will detect it and show an installation page
   - Click "Install" or "Confirm installation"

4. **Verify Installation:**
   - Visit [Perplexity AI](https://www.perplexity.ai)
   - The script should now be active
   - Check your userscript manager to see it listed

### Method 2: Install from dist/ Folder

If you want to use development versions:

1. **Navigate to Repository:**
   - Go to the [main repository](https://github.com/pv-udpv/perplexity-ai-userscripts)
   - Click on the `dist/` folder

2. **Select a Script:**
   - Click on a `.user.js` file (e.g., `vitemonkey-built.user.js`)
   - Click the "Raw" button to view the raw file

3. **Install:**
   - Your userscript manager will detect the script
   - Click "Install"
   - Or copy the entire script content and paste it into a new script in your manager

### Method 3: Manual Installation

For advanced users or custom modifications:

1. **Open Tampermonkey Dashboard:**
   - Click the Tampermonkey icon in your browser
   - Select "Dashboard"

2. **Create New Script:**
   - Click the "+" icon or "Create a new script"

3. **Paste Script Content:**
   - Copy the entire content from a `.user.js` file
   - Paste it into the editor
   - Press Ctrl+S (or Cmd+S on Mac) to save

4. **Enable the Script:**
   - The script should be automatically enabled
   - Toggle it on if needed

---

## Updating Userscripts

Userscripts can be updated manually or automatically.

### Automatic Updates (Recommended)

Most userscripts are configured to check for updates automatically.

**How it works:**
- Tampermonkey checks for updates daily by default
- If a new version is available, it's downloaded and installed
- You'll see a notification in your userscript manager

**Configure Update Settings:**

1. **Open Tampermonkey Settings:**
   - Click Tampermonkey icon → Settings

2. **Adjust Update Interval:**
   - Find "Script Update" section
   - Set check interval (default: 24 hours)
   - Options: Never, Daily, Weekly, Monthly

3. **Per-Script Settings:**
   - Open Dashboard → Click on a script
   - Go to "Settings" tab
   - Configure "Check interval" and "Update URL"

### Manual Updates

To manually update a specific script:

**Method 1: Through Tampermonkey**

1. Open Tampermonkey Dashboard
2. Find the script you want to update
3. Click the "Last updated" timestamp
4. Click "Check for updates"
5. If an update is available, click "Install update"

**Method 2: Reinstall from Source**

1. Go to the [Releases page](https://github.com/pv-udpv/perplexity-ai-userscripts/releases)
2. Download the latest `.user.js` file
3. Click to install (it will replace the old version)

### Update Verification

After updating:

1. Visit [Perplexity AI](https://www.perplexity.ai)
2. Open browser DevTools (F12)
3. Check Console for script initialization messages
4. Verify the version number in Tampermonkey Dashboard

---

## Uninstalling Userscripts

To remove a userscript:

### Using Tampermonkey

1. Click Tampermonkey icon
2. Click "Dashboard"
3. Find the script to remove
4. Click the trash icon (🗑️) on the right
5. Confirm deletion

### Using Violentmonkey

1. Click Violentmonkey icon
2. Click "Open Dashboard"
3. Find the script to remove
4. Click the trash icon
5. Confirm deletion

**Note:** Uninstalling removes the script but keeps your browser extension installed.

---

## Troubleshooting

### Script Not Working

**1. Check if Script is Enabled:**
- Open userscript manager dashboard
- Look for a green checkmark or toggle
- Enable the script if it's disabled

**2. Verify Match Patterns:**
- Open the script in your userscript manager
- Check that `@match` includes `https://www.perplexity.ai/*`
- If you're on a different domain, the script won't run

**3. Clear Browser Cache:**
```
Chrome/Edge: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
Firefox: Ctrl+Shift+Delete
```
- Select "Cached images and files"
- Clear cache and reload Perplexity AI

**4. Check Browser Console:**
- Press F12 to open DevTools
- Go to Console tab
- Look for error messages starting with script name
- Common errors:
  - `GM_getValue is not defined` → Check granted permissions
  - `Element not found` → Perplexity UI might have changed
  - `TypeError` → Script might need an update

### Script Conflicts

If multiple scripts cause issues:

1. Disable all scripts except one
2. Enable scripts one by one
3. Identify which combination causes conflict
4. Report issue on [GitHub Issues](https://github.com/pv-udpv/perplexity-ai-userscripts/issues)

### Permission Errors

If you see permission-related errors:

1. Open the script in Tampermonkey editor
2. Check `@grant` directives at the top
3. Required grants:
   ```javascript
   // @grant        GM_setValue
   // @grant        GM_getValue
   // @grant        GM_xmlhttpRequest
   ```
4. Save the script after verifying

### Perplexity UI Changes

If Perplexity updates their interface:

1. Check if script needs an update
2. Visit [Releases](https://github.com/pv-udpv/perplexity-ai-userscripts/releases) for latest version
3. Report issues on GitHub if problem persists

---

## FAQ

### Do I need to install all scripts?

No, install only the scripts you want to use. Each script is independent.

### Are these scripts safe?

Yes, all scripts are:
- Open source (you can review the code)
- MIT licensed
- Do not collect or transmit personal data
- Use standard browser APIs

### Will scripts slow down my browser?

Properly written userscripts have minimal performance impact. These scripts:
- Are optimized for performance
- Run only on Perplexity AI pages
- Use efficient DOM manipulation
- Clean up resources when not needed

### Can I use these with Perplexity Pro?

Yes, these scripts work with both free and Pro accounts.

### How do I report bugs?

1. Open an [issue on GitHub](https://github.com/pv-udpv/perplexity-ai-userscripts/issues)
2. Include:
   - Browser and version
   - Userscript manager and version
   - Script name and version
   - Steps to reproduce
   - Error messages from console

### Can I modify these scripts?

Yes! All scripts are MIT licensed. You can:
- Modify for personal use
- Fork and create your own version
- Contribute improvements back to the project

### Do scripts work on mobile?

Mobile browser support for userscripts is limited:
- **iOS Safari**: Requires special apps (not officially supported)
- **Android Firefox**: Supports Tampermonkey/Violentmonkey
- **Android Chrome**: Limited support via Kiwi Browser

### How often should I update?

- Automatic updates: Let Tampermonkey handle it (daily checks)
- Manual updates: Check monthly or when you notice issues
- Critical updates: Watch the repository for security updates

### What if a script breaks Perplexity?

1. Disable the script immediately
2. Refresh Perplexity AI
3. Report the issue on GitHub
4. Wait for an update or help troubleshoot

### Can I request new features?

Yes! Use [GitHub Discussions](https://github.com/pv-udpv/perplexity-ai-userscripts/discussions) or open a feature request issue.

---

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/pv-udpv/perplexity-ai-userscripts/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pv-udpv/perplexity-ai-userscripts/discussions)
- **Documentation**: [README.md](./README.md)
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Last Updated**: December 2025
