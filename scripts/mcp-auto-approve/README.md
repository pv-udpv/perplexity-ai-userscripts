# MCP Auto-Approve Plugin

Automatically approves MCP (Model Context Protocol) operations on Perplexity AI based on configurable rules.

## Features

- 🔧 **Configurable Rules**: Define approval rules per provider (GitHub, Linear, Slack, etc.)
- 🎯 **Pattern Matching**: Support for wildcards and glob patterns
- ⏱️ **Countdown Timer**: Visual countdown with cancel option
- 🔒 **Security**: Never auto-approve delete operations by default
- 📋 **Audit Logging**: Complete audit trail in console
- ⌨️ **Keyboard Shortcuts**: Ctrl+Shift+M for config, Esc to cancel
- 💾 **Import/Export**: Save and share configurations

## Installation

1. Install Tampermonkey or Violentmonkey
2. Click "Install" on the userscript file
3. Visit perplexity.ai
4. Press Ctrl+Shift+M to configure

## Configuration

### Default Config

```json
{
  "enabled": true,
  "defaultDelay": 3,
  "providers": [
    {
      "name": "github",
      "rules": [
        {
          "repoPattern": "pv-udpv/*",
          "operations": ["create", "update"],
          "pathPatterns": ["scripts/**", "docs/**", "*.md"],
          "autoApprove": true,
          "delay": 2,
          "requireConfirmation": true
        },
        {
          "repoPattern": "*",
          "operations": ["delete"],
          "autoApprove": false
        }
      ]
    }
  ]
}
```

### Pattern Syntax

- `owner/repo` - Exact repository match
- `owner/*` - All repos by owner
- `*` - All repositories
- `scripts/**` - Glob pattern for file paths
- `*.md` - File extension match

### Operations

- `create` - File/resource creation
- `update` - File/resource updates
- `delete` - File/resource deletion (⚠️ never auto-approved by default)
- `read` - Read-only operations

## Usage

### Basic Workflow

1. Perplexity suggests a GitHub operation
2. Plugin detects MCP call via network interception
3. Matches against configured rules
4. Shows countdown overlay (if `requireConfirmation: true`)
5. User can cancel by clicking "Cancel" or pressing Esc
6. Auto-clicks "Одобрить" button after countdown
7. Logs audit entry to console

### Keyboard Shortcuts

- **Ctrl+Shift+M** - Open config panel
- **Esc** - Cancel active countdown

### Config Panel

- Toggle plugin on/off
- Adjust default delay
- View configured rules
- Export config to JSON
- Import config from JSON

## Security

### Best Practices

1. **Never auto-approve deletes**: Default config blocks all delete operations
2. **Use specific patterns**: Avoid `*` for production repos
3. **Enable confirmation**: Always use `requireConfirmation: true` for important operations
4. **Review audit logs**: Check console for all auto-approvals

### Audit Trail

Every auto-approval is logged:

```javascript
🤖 MCP Auto-Approval Audit
  Timestamp: 2025-12-25T00:00:00.000Z
  Provider: github
  Operation: update
  Resource: file
  Repository: pv-udpv/perplexity-ai-plug
  File Path: scripts/mcp-auto-approve/index.ts
  Matched Rule: { repoPattern: 'pv-udpv/*', ... }
```

## Examples

### Scenario 1: Trust Personal Repos

```json
{
  "repoPattern": "pv-udpv/*",
  "operations": ["create", "update"],
  "delay": 2,
  "autoApprove": true,
  "requireConfirmation": true
}
```

### Scenario 2: Docs-Only Auto-Approve

```json
{
  "repoPattern": "company/production-app",
  "operations": ["create", "update"],
  "pathPatterns": ["docs/**", "README.md"],
  "delay": 5,
  "autoApprove": true
}
```

### Scenario 3: Block All Deletes

```json
{
  "repoPattern": "*",
  "operations": ["delete"],
  "autoApprove": false
}
```

## Troubleshooting

### Approve button not found

- Check console for error messages
- DOM structure may have changed
- Report issue with screenshot

### Rules not matching

- Open config panel (Ctrl+Shift+M)
- Check rule patterns
- Enable debug logging in console

### Countdown not showing

- Check `requireConfirmation: true` in rule
- Verify plugin is enabled
- Check for CSS conflicts

## Architecture

### Components

1. **Interceptor** - Hooks fetch/WebSocket APIs
2. **Config Manager** - Rule matching and storage
3. **UI Manager** - Countdown and config panel
4. **Main Script** - Orchestration and lifecycle

### Data Flow

```
Perplexity UI
    ↓ (MCP call)
Fetch/WebSocket Intercept
    ↓ (extract payload)
Config Manager
    ↓ (match rules)
UI Manager
    ↓ (countdown)
DOM Manipulation
    ↓ (click approve)
Audit Log
```

## Development

### Testing

```bash
# Run tests
npm test scripts/mcp-auto-approve

# Watch mode
npm test -- --watch
```

### Debugging

```javascript
// Enable verbose logging
localStorage.setItem('mcp-auto-approve-debug', 'true');

// View audit log
localStorage.getItem('mcp-auto-approve-audit-log');
```

## Roadmap

- [ ] Support for Linear, Slack, Notion providers
- [ ] Visual rule editor in config panel
- [ ] Test pattern matcher
- [ ] Regex pattern support
- [ ] Notification preferences
- [ ] Global pause/resume
- [ ] Per-session overrides

## License

MIT

## Credits

- Built with [Shared Modules](#8)
- Inspired by GitHub Copilot auto-approval workflows
- Part of [perplexity-ai-plug](https://github.com/pv-udpv/perplexity-ai-plug)
