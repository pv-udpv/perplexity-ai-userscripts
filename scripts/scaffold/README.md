# Auto-Scaffolding System

This directory contains the auto-scaffolding system for userscripts, which automatically extracts DOM structure and API endpoints from target websites.

## Files

### 1. `extract-dom.js`
Extracts DOM structure from a target URL using headless Chrome.

**Features:**
- Finds all elements with `data-testid` attributes
- Generates CSS selectors and XPath expressions
- Captures element metadata (type, classes, text, attributes)
- Maps element hierarchy (parent-child relationships)

**Usage:**
```bash
node extract-dom.js --url https://example.com --output dom.json
```

**Output format:**
```json
{
  "elements": {
    "element-name": {
      "selector": "[data-testid=\"element-name\"]",
      "type": "button",
      "classes": "btn btn-primary",
      "text": "Click me",
      "attributes": { "type": "submit" },
      "xpath": "/html/body/div[1]/button[1]",
      "parent": null,
      "children": []
    }
  }
}
```

### 2. `extract-api.js`
Extracts API endpoints from network requests using headless Chrome.

**Features:**
- Intercepts all fetch/XHR requests
- Captures request/response data
- Generates TypeScript interfaces automatically
- Simulates user interactions to trigger API calls

**Usage:**
```bash
node extract-api.js --url https://example.com --output api.json
```

**Output format:**
```json
{
  "apis": {
    "https://api.example.com/v1/users": {
      "status": 200,
      "headers": { "content-type": "application/json" },
      "body": { "users": [...] },
      "method": "GET",
      "timestamp": 1234567890
    }
  },
  "interfaces": {
    "ApiV1UsersResponse": {
      "url": "https://api.example.com/v1/users",
      "method": "GET",
      "response": { "users": "object[]" }
    }
  }
}
```

### 3. `enhanced-scaffold.js`
Enhanced scaffolding generator that creates userscript projects with DOM and API data.

**Features:**
- Creates complete project structure
- Generates TypeScript types from API responses
- Generates DOM selectors from extracted elements
- Creates test templates
- Generates documentation

**Usage:**
```bash
# Simple mode (no DOM/API extraction)
node enhanced-scaffold.js --name my-plugin

# Advanced mode (with DOM/API data)
node enhanced-scaffold.js \
  --name my-plugin \
  --dom dom.json \
  --api api.json \
  --features "Feature 1
Feature 2"
```

**Generated structure:**
```
scripts/my-plugin/
├── index.ts              # Main implementation
├── manifest.json         # Userscript metadata
├── api.ts                # Auto-generated API types
├── dom.ts                # Auto-generated DOM selectors
├── types.ts              # TypeScript definitions
├── utils.ts              # Helper functions
├── __tests__/
│   └── index.test.ts     # Test template
├── README.md             # Documentation
└── SCAFFOLD_README.md    # PR description
```

## GitHub Actions Integration

The scaffolding system is integrated with GitHub Actions via `.github/workflows/scaffold.yml`.

**Workflow:**
1. User creates an issue with label `scaffold-request`
2. GitHub Actions parses the issue
3. Runs `extract-dom.js` and `extract-api.js` on the target URL
4. Runs `enhanced-scaffold.js` to generate the project
5. Creates a PR with the generated code

See [`.github/workflows/README.md`](../../.github/workflows/README.md) for details.

## Requirements

- Node.js 18+
- Puppeteer (automatically installs Chrome)
- minimist (for CLI argument parsing)

## Examples

### Example 1: Simple Scaffolding
```bash
npm run scaffold my-plugin
```

### Example 2: Advanced Scaffolding
```bash
# Extract DOM
node scripts/scaffold/extract-dom.js \
  --url https://www.perplexity.ai \
  --output /tmp/dom.json

# Extract APIs
node scripts/scaffold/extract-api.js \
  --url https://www.perplexity.ai \
  --output /tmp/api.json

# Generate scaffold
node scripts/scaffold/enhanced-scaffold.js \
  --name perplexity-enhancer \
  --dom /tmp/dom.json \
  --api /tmp/api.json \
  --features "Add keyboard shortcuts
Save chat history"
```

## Limitations

- **DOM Extraction**: Only finds elements with `data-testid` attributes
- **API Extraction**: May miss APIs that require authentication or complex interactions
- **Type Inference**: Basic type inference may not capture all edge cases
- **Network**: Requires internet access to load target URL

## Troubleshooting

### Puppeteer fails to install Chrome
Set `PUPPETEER_SKIP_DOWNLOAD=true` when running `npm install`, then install Chrome separately:
```bash
PUPPETEER_SKIP_DOWNLOAD=1 npm install
npx puppeteer browsers install chrome
```

### Target URL doesn't load
- Check if URL requires authentication
- Try adding a delay or wait condition
- Check if website blocks headless browsers

### No DOM elements found
- Verify target website uses `data-testid` attributes
- Check console output for errors
- Try a different URL or page

### No APIs captured
- Website may not make API calls on initial load
- Try interacting with the page manually
- Check network tab in browser DevTools

## Future Improvements

- [ ] Support for other DOM selectors (not just data-testid)
- [ ] Better type inference for complex objects
- [ ] Support for GraphQL queries
- [ ] Mock data generation from API responses
- [ ] Screenshot capture for documentation
- [ ] Video recording of extraction process

## Contributing

To improve the scaffolding system:

1. Test with different websites
2. Report issues with specific URLs
3. Suggest improvements to type inference
4. Add support for more frameworks

---

**Last Updated**: Dec 26, 2025
