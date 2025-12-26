# Feature 4: StackBlitz Integration

> ⚠️ **IMPORTANT**: This is a planning document. Code examples are for illustration only and may contain security vulnerabilities. **Always review [SECURITY_CONSIDERATIONS.md](./SECURITY_CONSIDERATIONS.md) before implementing any code from this document.**

## 🎯 Goal
Web-based IDE for dump analysis with pre-configured analyzer environment.

## 📋 Task Breakdown

### Phase 1: StackBlitz Project Templates (2 hours)

#### Task 1.1: Create Template Directory Structure (15 min)
```
tools/stackblitz/
├── templates/
│   ├── python-analyzer/
│   │   ├── stackblitz.config.ts
│   │   ├── index.html
│   │   ├── analyze.py
│   │   ├── package.json
│   │   └── README.md
│   ├── typescript-analyzer/
│   │   ├── stackblitz.config.ts
│   │   ├── index.ts
│   │   ├── analyzer.ts
│   │   ├── package.json
│   │   └── README.md
│   └── jupyter-notebook/
│       ├── stackblitz.config.ts
│       ├── index.html
│       ├── notebook.ipynb
│       └── README.md
├── shared/
│   ├── dump-schema.json
│   └── sample-dump.json
├── scripts/
│   └── generate-links.ts
└── README.md
```

**Subtasks**:
- [ ] Create directory structure
- [ ] Add .gitignore
- [ ] Create README template

#### Task 1.2: Create Python Analyzer Template (1 hour)
**File**: `tools/stackblitz/templates/python-analyzer/stackblitz.config.ts`

```typescript
export default {
  title: 'Perplexity Dump Analyzer (Python)',
  description: 'Analyze Perplexity storage dumps using Python in the browser',
  template: 'node',
  files: {
    'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>Perplexity Dump Analyzer</title>
  <script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"></script>
  <style>
    body { font-family: system-ui; margin: 2rem; }
    #output { background: #f5f5f5; padding: 1rem; border-radius: 4px; }
    .button { padding: 0.5rem 1rem; margin: 0.5rem; cursor: pointer; }
    #file-input { margin: 1rem 0; }
  </style>
</head>
<body>
  <h1>📊 Perplexity Dump Analyzer</h1>
  
  <div>
    <input type="file" id="file-input" accept=".json" />
    <button class="button" onclick="runAnalysis()">Analyze</button>
  </div>
  
  <div id="output">
    <pre id="console"></pre>
  </div>
  
  <script type="module">
    let pyodide;
    let dumpData;
    
    async function initPyodide() {
      pyodide = await loadPyodide();
      await pyodide.loadPackage(['micropip']);
      
      // Load analyzer code
      const analyzerCode = await fetch('./analyze.py').then(r => r.text());
      await pyodide.runPythonAsync(analyzerCode);
      
      console.log('✅ Pyodide initialized');
    }
    
    document.getElementById('file-input').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      const text = await file.text();
      dumpData = JSON.parse(text);
      pyodide.globals.set('dump_json', text);
      console.log('✅ Dump loaded');
    });
    
    async function runAnalysis() {
      if (!dumpData) {
        alert('Please select a dump file first');
        return;
      }
      
      const output = await pyodide.runPythonAsync(\`
import json
dump = json.loads(dump_json)
analyze_dump(dump)
\`);
      
      document.getElementById('console').textContent = output;
    }
    
    window.runAnalysis = runAnalysis;
    initPyodide();
  </script>
</body>
</html>`,
    
    'analyze.py': `import json

def analyze_dump(dump):
    """Analyze Perplexity storage dump."""
    print("📊 Perplexity Dump Analysis")
    print("=" * 50)
    
    # Metadata
    metadata = dump.get('metadata', {})
    print(f"\\nTimestamp: {metadata.get('timestamp', 'N/A')}")
    print(f"URL: {metadata.get('url', 'N/A')}")
    
    # Storage
    storage = dump.get('storage', {})
    local = storage.get('localStorage', {})
    session = storage.get('sessionStorage', {})
    
    print(f"\\n📦 Storage")
    print(f"  localStorage: {len(local)} keys")
    print(f"  sessionStorage: {len(session)} keys")
    
    # IndexedDB
    indexeddb = dump.get('indexedDB', [])
    print(f"\\n🗄️  IndexedDB")
    for db in indexeddb:
        print(f"  Database: {db.get('name')} (v{db.get('version')})")
        for store in db.get('stores', []):
            print(f"    Store: {store.get('name')} - {store.get('count')} records")
    
    # Caches
    caches = dump.get('caches', {}).get('caches', [])
    total_entries = sum(len(c.get('entries', [])) for c in caches)
    print(f"\\n📦 Caches")
    print(f"  Total caches: {len(caches)}")
    print(f"  Total entries: {total_entries}")
    
    print("\\n✅ Analysis complete")

# Example usage (will be called from JavaScript)
# analyze_dump(json.loads(dump_json))
`,
    
    'package.json': `{
  "name": "perplexity-dump-analyzer",
  "version": "1.0.0",
  "description": "Analyze Perplexity storage dumps",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}`,
    
    'README.md': `# Perplexity Dump Analyzer

## Usage

1. Click "Open in StackBlitz" button
2. Upload your dump.json file
3. Click "Analyze" button
4. View results in the output panel

## Features

- Full Python environment in browser (Pyodide)
- No installation required
- Instant analysis
- Shareable results
`
  }
};
```

**Subtasks**:
- [ ] Create StackBlitz config
- [ ] Implement HTML interface
- [ ] Write Python analyzer script
- [ ] Add file upload handling
- [ ] Add Pyodide integration
- [ ] Test in StackBlitz

#### Task 1.3: Create TypeScript Analyzer Template (45 min)
**File**: `tools/stackblitz/templates/typescript-analyzer/index.ts`

```typescript
import { analyzeDump, DumpData } from './analyzer';

// File upload handler
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const analyzeBtn = document.getElementById('analyze-btn') as HTMLButtonElement;
const output = document.getElementById('output') as HTMLPreElement;

let dumpData: DumpData | null = null;

fileInput.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  
  const text = await file.text();
  dumpData = JSON.parse(text);
  console.log('✅ Dump loaded');
  analyzeBtn.disabled = false;
});

analyzeBtn.addEventListener('click', () => {
  if (!dumpData) return;
  
  const result = analyzeDump(dumpData);
  output.textContent = JSON.stringify(result, null, 2);
});
```

**File**: `tools/stackblitz/templates/typescript-analyzer/analyzer.ts`

```typescript
export interface DumpData {
  metadata: {
    timestamp: string;
    url: string;
  };
  storage: {
    localStorage: Record<string, any>;
    sessionStorage: Record<string, any>;
  };
  indexedDB: Array<{
    name: string;
    version: number;
    stores: Array<{
      name: string;
      count: number;
      records: any[];
    }>;
  }>;
}

export function analyzeDump(dump: DumpData) {
  return {
    metadata: dump.metadata,
    storage: {
      localStorageKeys: Object.keys(dump.storage.localStorage).length,
      sessionStorageKeys: Object.keys(dump.storage.sessionStorage).length,
    },
    indexedDB: dump.indexedDB.map(db => ({
      name: db.name,
      version: db.version,
      storeCount: db.stores.length,
      totalRecords: db.stores.reduce((sum, store) => sum + store.count, 0),
    })),
  };
}
```

**Subtasks**:
- [ ] Create TypeScript analyzer
- [ ] Add type definitions
- [ ] Implement analysis functions
- [ ] Create UI components
- [ ] Test in StackBlitz

---

### Phase 2: Python WASM Integration (4 hours)

#### Task 2.1: Research Pyodide Capabilities (30 min)
**Questions to answer**:
- [ ] Which Python packages are available?
- [ ] Can we use micropip to install packages?
- [ ] What are the performance characteristics?
- [ ] What are the memory limitations?

**Document findings**: `tools/stackblitz/PYODIDE_NOTES.md`

#### Task 2.2: Create Pyodide Wrapper (1.5 hours)
**File**: `tools/stackblitz/shared/pyodide-wrapper.ts`

```typescript
export class PyodideWrapper {
  private pyodide: any = null;
  private initialized = false;
  
  async initialize() {
    if (this.initialized) return;
    
    // Load Pyodide
    const pyodideScript = document.createElement('script');
    pyodideScript.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
    document.head.appendChild(pyodideScript);
    
    await new Promise((resolve) => {
      pyodideScript.onload = resolve;
    });
    
    this.pyodide = await (window as any).loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
    });
    
    // Load packages
    await this.pyodide.loadPackage(['micropip']);
    
    this.initialized = true;
  }
  
  async installPackage(name: string) {
    await this.pyodide.runPythonAsync(`
      import micropip
      await micropip.install('${name}')
    `);
  }
  
  async runCode(code: string): Promise<any> {
    return await this.pyodide.runPythonAsync(code);
  }
  
  setGlobal(name: string, value: any) {
    this.pyodide.globals.set(name, value);
  }
  
  getGlobal(name: string): any {
    return this.pyodide.globals.get(name);
  }
}
```

**Subtasks**:
- [ ] Implement Pyodide loading
- [ ] Add package installation
- [ ] Add code execution
- [ ] Add global variable management
- [ ] Add error handling
- [ ] Test with sample code

#### Task 2.3: Port Analyzer to Browser (1.5 hours)
**File**: `tools/stackblitz/templates/python-analyzer/browser-analyzer.py`

```python
"""
Browser-compatible version of analyze-dump.py
Simplified to work in Pyodide environment.
"""

import json
from collections import defaultdict

def analyze_dump(dump_json_str):
    """Analyze dump from JSON string."""
    dump = json.loads(dump_json_str)
    
    results = {
        'metadata': analyze_metadata(dump),
        'storage': analyze_storage(dump),
        'indexeddb': analyze_indexeddb(dump),
        'caches': analyze_caches(dump),
    }
    
    return json.dumps(results, indent=2)

def analyze_metadata(dump):
    metadata = dump.get('metadata', {})
    return {
        'timestamp': metadata.get('timestamp'),
        'url': metadata.get('url'),
        'userAgent': metadata.get('userAgent'),
    }

def analyze_storage(dump):
    storage = dump.get('storage', {})
    local = storage.get('localStorage', {})
    session = storage.get('sessionStorage', {})
    
    return {
        'localStorage': {
            'keyCount': len(local),
            'totalSize': sum(len(json.dumps(v)) for v in local.values()),
            'keys': list(local.keys()),
        },
        'sessionStorage': {
            'keyCount': len(session),
            'totalSize': sum(len(json.dumps(v)) for v in session.values()),
            'keys': list(session.keys()),
        }
    }

def analyze_indexeddb(dump):
    databases = dump.get('indexedDB', [])
    results = []
    
    for db in databases:
        stores = []
        for store in db.get('stores', []):
            stores.append({
                'name': store.get('name'),
                'count': store.get('count'),
                'keyPath': store.get('keyPath'),
            })
        
        results.append({
            'name': db.get('name'),
            'version': db.get('version'),
            'stores': stores,
        })
    
    return results

def analyze_caches(dump):
    caches = dump.get('caches', {}).get('caches', [])
    total_entries = sum(len(c.get('entries', [])) for c in caches)
    
    return {
        'cacheCount': len(caches),
        'totalEntries': total_entries,
        'names': [c.get('name') for c in caches],
    }
```

**Subtasks**:
- [ ] Port core analyzer logic
- [ ] Remove dependencies not available in Pyodide
- [ ] Simplify output format
- [ ] Add JSON serialization
- [ ] Test in browser

#### Task 2.4: Integration Testing (30 min)
- [ ] Test Python analyzer in StackBlitz
- [ ] Test with sample dump
- [ ] Test with large dump (>1MB)
- [ ] Verify performance
- [ ] Test error handling

---

### Phase 3: Template Gallery (2 hours)

#### Task 3.1: Create Quick Analysis Template (30 min)
**Features**:
- Basic stats and charts
- Fast loading
- Minimal dependencies

**Subtasks**:
- [ ] Create template structure
- [ ] Add basic analysis
- [ ] Add simple visualizations
- [ ] Test in StackBlitz

#### Task 3.2: Create Deep Dive Template (45 min)
**Features**:
- Full analysis with code graph
- Advanced visualizations
- Export capabilities

**Subtasks**:
- [ ] Create template structure
- [ ] Add comprehensive analysis
- [ ] Add advanced visualizations
- [ ] Add export functionality
- [ ] Test in StackBlitz

#### Task 3.3: Create API Explorer Template (45 min)
**Features**:
- API schema extraction
- OpenAPI viewer
- Request/response explorer

**Subtasks**:
- [ ] Create template structure
- [ ] Add API analysis
- [ ] Add schema visualization
- [ ] Add OpenAPI export
- [ ] Test in StackBlitz

---

### Phase 4: Share & Embed (2 hours)

#### Task 4.1: Create Link Generator (1 hour)
**File**: `tools/stackblitz/scripts/generate-links.ts`

```typescript
interface StackBlitzProject {
  title: string;
  description: string;
  template: 'node' | 'typescript' | 'angular' | 'react';
  files: Record<string, string>;
}

function generateStackBlitzUrl(project: StackBlitzProject): string {
  const params = new URLSearchParams({
    title: project.title,
    description: project.description,
    template: project.template,
  });
  
  // Add files
  Object.entries(project.files).forEach(([path, content]) => {
    params.append(`file[${path}]`, content);
  });
  
  return `https://stackblitz.com/edit/perplexity-analyzer?${params.toString()}`;
}

function generateEmbedCode(url: string, height: number = 500): string {
  return `<iframe
  src="${url}?embed=1"
  style="width:100%; height:${height}px; border:0; border-radius: 4px; overflow:hidden;"
  title="Perplexity Dump Analyzer"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>`;
}

// Export functions
export { generateStackBlitzUrl, generateEmbedCode };
```

**Subtasks**:
- [ ] Implement URL generation
- [ ] Implement embed code generation
- [ ] Add configuration options
- [ ] Test generated URLs
- [ ] Test embed codes

#### Task 4.2: Create Demo Page (30 min)
**File**: `tools/stackblitz/demo.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>StackBlitz Templates - Perplexity Dump Analyzer</title>
  <style>
    body { font-family: system-ui; margin: 2rem; max-width: 1200px; margin: 0 auto; }
    .template { border: 1px solid #ddd; padding: 1rem; margin: 1rem 0; border-radius: 4px; }
    .button { padding: 0.5rem 1rem; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>📦 StackBlitz Templates</h1>
  
  <div class="template">
    <h2>Python Analyzer</h2>
    <p>Full Python environment in the browser using Pyodide.</p>
    <a href="#" class="button">Open in StackBlitz</a>
  </div>
  
  <div class="template">
    <h2>TypeScript Analyzer</h2>
    <p>Fast TypeScript-based analyzer with type safety.</p>
    <a href="#" class="button">Open in StackBlitz</a>
  </div>
  
  <div class="template">
    <h2>Quick Analysis</h2>
    <p>Basic stats and charts for quick insights.</p>
    <a href="#" class="button">Open in StackBlitz</a>
  </div>
  
  <h2>🎥 Demo</h2>
  <iframe 
    src="https://stackblitz.com/edit/perplexity-analyzer?embed=1"
    style="width:100%; height:500px; border:0; border-radius: 4px;"
  ></iframe>
</body>
</html>
```

**Subtasks**:
- [ ] Create demo page
- [ ] Add template cards
- [ ] Add embedded demo
- [ ] Test all links
- [ ] Deploy demo page

#### Task 4.3: Documentation (30 min)
**File**: `tools/stackblitz/README.md`

**Sections**:
- [ ] Overview
- [ ] Available templates
- [ ] How to use
- [ ] How to customize
- [ ] Embedding guide
- [ ] Troubleshooting

---

## 🎯 Acceptance Criteria

### Functional
- [x] Python WASM template working
- [x] TypeScript template working
- [x] 3+ template variations available
- [x] File upload working in all templates
- [x] Analysis running correctly
- [x] Shareable URLs working
- [x] Embed codes working

### Quality
- [x] Templates load quickly (<5s)
- [x] Analysis completes in reasonable time
- [x] Error handling is robust
- [x] Documentation is complete

### User Experience
- [x] Templates are easy to use
- [x] Instructions are clear
- [x] Sharing is simple
- [x] Embedded demos work well

---

## 📊 Effort Summary

| Task | Hours |
|------|-------|
| Phase 1: Project Templates | 2.0 |
| Phase 2: Python WASM Integration | 4.0 |
| Phase 3: Template Gallery | 2.0 |
| Phase 4: Share & Embed | 2.0 |
| **Total** | **10.0** |

---

## 🔗 Dependencies

**Required**:
- Pyodide (CDN)
- StackBlitz account (free)

**Optional**:
- Feature 1 (Code Analysis) - for advanced templates
- Feature 2 (API Analysis) - for API explorer template

---

## 🚀 Next Steps

After completing this feature:
1. Publish templates to StackBlitz
2. Add more template variations
3. Create video tutorials
4. Gather user feedback
5. Consider WebContainers for more complex setups

---

**Status**: Ready for Implementation  
**Priority**: Medium  
**Complexity**: Medium
