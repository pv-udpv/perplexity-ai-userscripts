# GitHub Auto-Approve for Perplexity AI

Automatically approve GitHub operations in Perplexity AI based on configurable rules.

## Features

- 🎯 **Repository Whitelisting**: Support for specific repos, wildcards (`owner/*`), or all (`*`)
- ⏱️ **Countdown Timer**: Configurable delay with visual feedback and cancel option
- 🎨 **Beautiful UI**: Gradient overlay with progress bar
- ⚙️ **Config Panel**: Easy configuration with keyboard shortcut (Ctrl+Shift+G)
- 📝 **Audit Logging**: All actions logged to console
- 🔒 **Operation Filtering**: Filter by operation type (create, update, delete)
- 📂 **Path Patterns**: Match specific file paths with glob patterns
- 🛡️ **Security First**: Delete operations require explicit whitelisting

## Installation

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Violentmonkey](https://violentmonkey.github.io/)

2. Install the script:
   - Open `/dist/perplexity-ai-userscripts.user.js` in your browser
   - Or copy the content and create a new userscript in your manager

3. Visit [perplexity.ai](https://www.perplexity.ai) - the script is now active!

## Usage

### Opening Configuration Panel

Press `Ctrl+Shift+G` to open the configuration panel.

### Configuration Options

#### Global Settings

- **Enable Auto-Approve**: Master toggle for the entire feature
- **Default Delay**: Default countdown time in seconds (0-60)

#### Rules

Each rule consists of:

1. **Repository Pattern**:
   - Exact match: `pv-udpv/perplexity-ai-userscripts`
   - Wildcard owner: `pv-udpv/*` (all repos from owner)
   - Match all: `*`
   - Regex: Any valid regex pattern

2. **Operations**: Select which operations to auto-approve
   - `create` - Creating new files
   - `update` - Updating existing files
   - `delete` - Deleting files (⚠️ use with caution)

3. **Path Patterns** (optional): Glob patterns for file paths
   - `docs/**` - All files in docs directory
   - `*.md` - All markdown files
   - `scripts/**/*.ts` - TypeScript files in scripts

### Example Configurations

#### Safe Default - Trust All Creates and Updates
```json
{
  "enabled": true,
  "defaultDelay": 5,
  "rules": [
    {
      "repoPattern": "*",
      "operations": ["create", "update"],
      "delay": 5,
      "autoApprove": true
    }
  ]
}
```

#### Owner-Specific - Trust Your Repos
```json
{
  "enabled": true,
  "defaultDelay": 3,
  "rules": [
    {
      "repoPattern": "your-username/*",
      "operations": ["create", "update", "delete"],
      "delay": 3,
      "autoApprove": true
    }
  ]
}
```

#### Documentation Only
```json
{
  "enabled": true,
  "defaultDelay": 2,
  "rules": [
    {
      "repoPattern": "*",
      "operations": ["create", "update"],
      "pathPatterns": ["docs/**", "*.md", "README.md"],
      "delay": 2,
      "autoApprove": true
    }
  ]
}
```

#### Multi-Rule Setup
```json
{
  "enabled": true,
  "defaultDelay": 5,
  "rules": [
    {
      "repoPattern": "pv-udpv/perplexity-ai-userscripts",
      "operations": ["create", "update"],
      "pathPatterns": ["docs/**", "scripts/**"],
      "delay": 3,
      "autoApprove": true
    },
    {
      "repoPattern": "pv-udpv/*",
      "operations": ["create", "update"],
      "delay": 5,
      "autoApprove": true
    },
    {
      "repoPattern": "*",
      "operations": ["delete"],
      "autoApprove": false
    }
  ]
}
```

## How It Works

1. **Detection**: MutationObserver monitors the page for GitHub approval prompts
2. **Matching**: When detected, checks against your configured rules
3. **Countdown**: If matched, displays a countdown overlay
4. **Approval**: After countdown completes, automatically clicks the approve button
5. **Logging**: All actions are logged to the browser console

## Visual Countdown

When a matching operation is detected, you'll see:
- Purple gradient overlay with countdown message
- Progress bar showing remaining time
- Cancel button to stop auto-approval

## Audit Logging

All auto-approvals are logged to the console:
```
[github-auto-approve] [AUDIT] 2024-12-24T18:00:00.000Z auto-approved pv-udpv/repo update (rule: Auto-approved by rule)
```

Check your browser's DevTools Console to see the audit trail.

## Security Considerations

⚠️ **Important Security Notes:**

1. **Delete Operations**: Never auto-approve delete operations by default. Always require explicit whitelisting.

2. **Repository Trust**: Only add repositories you fully trust to your whitelist.

3. **Review Rules**: Regularly review your rules and remove outdated ones.

4. **Countdown Time**: Use reasonable countdown times (3-5 seconds minimum) to allow cancellation.

5. **Path Patterns**: Be specific with path patterns to avoid unintended approvals.

6. **First Use**: The script shows a warning for first-time repository approvals.

## Troubleshooting

### Script Not Working

1. Check if the script is enabled in your userscript manager
2. Verify you're on `perplexity.ai` domain
3. Open browser console and look for `[github-auto-approve]` messages
4. Try disabling and re-enabling the script

### Approval Not Triggering

1. Press `Ctrl+Shift+G` to verify configuration
2. Check if rules match the repository and operation
3. Look for console errors
4. Verify the GitHub prompt is actually visible on the page

### Configuration Not Saving

1. Check browser console for errors
2. Verify your userscript manager supports `GM_setValue`/`GM_getValue`
3. Try clearing the configuration and starting fresh
4. Check if LocalStorage is enabled in your browser

## Development

### Building

```bash
npm install
npm run build
```

Output: `dist/perplexity-ai-userscripts.user.js`

### Testing

1. Make changes to `scripts/github-auto-approve/index.ts`
2. Run `npm run build`
3. Copy content from `dist/perplexity-ai-userscripts.user.js`
4. Paste into Tampermonkey editor
5. Test on perplexity.ai

### File Structure

```
scripts/github-auto-approve/
├── index.ts         # Main script logic
├── types.ts         # TypeScript type definitions
├── utils.ts         # Helper functions
├── manifest.json    # Userscript metadata
└── README.md        # This file
```

## Contributing

Contributions welcome! Please:

1. Follow the existing code style
2. Add JSDoc comments for functions
3. Test thoroughly on Perplexity AI
4. Update documentation

## License

MIT License - see [LICENSE](../../LICENSE)

## Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/pv-udpv/perplexity-ai-userscripts/issues)
- 💡 **Feature Requests**: [Discussions](https://github.com/pv-udpv/perplexity-ai-userscripts/discussions)
- 📖 **Documentation**: [Main README](../../README.md)

---

**Version**: 1.0.0  
**Author**: pv-udpv  
**Last Updated**: December 2024
