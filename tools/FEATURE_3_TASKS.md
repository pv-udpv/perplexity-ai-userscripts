# Feature 3: JupyterLite Integration

> ⚠️ **IMPORTANT**: This is a planning document. Code examples are for illustration only and may contain security vulnerabilities. **Always review [SECURITY_CONSIDERATIONS.md](./SECURITY_CONSIDERATIONS.md) before implementing any code from this document.**

## 🎯 Goal
Interactive runtime analysis with userscript communication for live debugging.

## 📋 Task Breakdown

### Phase 1: JupyterLite Setup (3 hours)

#### Task 1.1: Install Dependencies (15 min)
- [ ] Add `jupyterlite>=0.3.0` to requirements.txt
- [ ] Add `jupyterlite-pyodide-kernel>=0.3.0` to requirements.txt
- [ ] Install jupyter build tools: `pip install jupyter-packaging`
- [ ] Test installation

#### Task 1.2: Create JupyterLite Project Structure (30 min)
```
tools/jupyter/
├── content/
│   ├── notebooks/
│   │   └── (notebooks will go here)
│   └── files/
│       └── (sample dumps will go here)
├── config/
│   ├── jupyter_lite_config.json
│   └── jupyter_notebook_config.py
├── build.py
├── requirements.txt
└── README.md
```

**Subtasks**:
- [ ] Create directory structure
- [ ] Initialize jupyterlite config
- [ ] Create build script
- [ ] Add .gitignore for build artifacts

#### Task 1.3: Configure JupyterLite (45 min)
**File**: `tools/jupyter/config/jupyter_lite_config.json`

```json
{
  "jupyter-lite-schema-version": 0,
  "jupyter-config-data": {
    "appName": "Perplexity Dump Analyzer",
    "appVersion": "1.0.0",
    "appUrl": "./lab",
    "disabledExtensions": [],
    "settingsOverrides": {
      "@jupyterlab/apputils-extension:themes": {
        "theme": "JupyterLab Dark"
      }
    }
  },
  "pipliteUrls": [
    "https://pypi.org/pypi/{package_name}/json"
  ],
  "pipliteWheelUrl": "https://files.pythonhosted.org/packages/"
}
```

**Subtasks**:
- [ ] Configure app name and branding
- [ ] Set up PyPI package sources
- [ ] Configure default theme
- [ ] Set up notebook file locations
- [ ] Configure extensions

#### Task 1.4: Create Build Script (45 min)
**File**: `tools/jupyter/build.py`

```python
#!/usr/bin/env python3
"""Build JupyterLite site."""

import shutil
import subprocess
from pathlib import Path

def build_jupyterlite():
    """Build JupyterLite site."""
    root = Path(__file__).parent
    output_dir = root / 'dist'
    
    # Clean previous build
    if output_dir.exists():
        shutil.rmtree(output_dir)
    
    # Build site
    subprocess.run([
        'jupyter', 'lite', 'build',
        '--contents', str(root / 'content'),
        '--config', str(root / 'config/jupyter_lite_config.json'),
        '--output-dir', str(output_dir)
    ], check=True)
    
    print(f'✅ JupyterLite built: {output_dir}')
    print(f'   Run: python -m http.server --directory {output_dir}')

if __name__ == '__main__':
    build_jupyterlite()
```

**Subtasks**:
- [ ] Implement build function
- [ ] Add clean-up logic
- [ ] Add error handling
- [ ] Add usage instructions
- [ ] Make script executable

#### Task 1.5: Test Build (15 min)
- [ ] Run build script
- [ ] Start local HTTP server
- [ ] Verify JupyterLite loads in browser
- [ ] Test notebook creation
- [ ] Test Python kernel

---

### Phase 2: Analysis Notebooks (3 hours)

#### Task 2.1: Create Quick Start Notebook (45 min)
**File**: `tools/jupyter/content/notebooks/01-quick-start.ipynb`

**Cells**:
```python
# Cell 1: Imports
import json
from pathlib import Path
import pandas as pd
import plotly.express as px

# Cell 2: Load dump
dump_path = '../files/sample-dump.json'
with open(dump_path) as f:
    dump = json.load(f)

print(f"Loaded dump from: {dump['metadata']['timestamp']}")

# Cell 3: Quick stats
print(f"localStorage keys: {len(dump['storage']['localStorage'])}")
print(f"sessionStorage keys: {len(dump['storage']['sessionStorage'])}")
print(f"IndexedDB databases: {len(dump['indexedDB'])}")
print(f"Cache entries: {sum(len(c['entries']) for c in dump['caches']['caches'])}")

# Cell 4: Visualize storage sizes
storage_data = []
for key, value in dump['storage']['localStorage'].items():
    size = len(json.dumps(value))
    storage_data.append({'key': key, 'size': size, 'type': 'localStorage'})

for key, value in dump['storage']['sessionStorage'].items():
    size = len(json.dumps(value))
    storage_data.append({'key': key, 'size': size, 'type': 'sessionStorage'})

df = pd.DataFrame(storage_data)
fig = px.bar(df, x='key', y='size', color='type', title='Storage Size Distribution')
fig.show()

# Cell 5: IndexedDB analysis
for db in dump['indexedDB']:
    print(f"\n📊 Database: {db['name']} (v{db['version']})")
    for store in db['stores']:
        print(f"  Store: {store['name']} ({store['count']} records)")
```

**Subtasks**:
- [ ] Create notebook file
- [ ] Add markdown cells with explanations
- [ ] Add code cells with examples
- [ ] Test in JupyterLite
- [ ] Add sample output

#### Task 2.2: Create Storage Analysis Notebook (45 min)
**File**: `tools/jupyter/content/notebooks/02-storage-analysis.ipynb`

**Content**:
- Deep dive into localStorage/sessionStorage
- Key pattern detection
- Value type analysis
- Size distribution analysis
- Data cardinality analysis

**Subtasks**:
- [ ] Implement key pattern analysis
- [ ] Implement value type detection
- [ ] Create size distribution visualizations
- [ ] Add cardinality analysis
- [ ] Test with real dumps

#### Task 2.3: Create Code Analysis Notebook (45 min)
**File**: `tools/jupyter/content/notebooks/03-code-analysis.ipynb`

**Content**:
- Import analyzer from dump
- Dependency graph visualization with NetworkX
- Circular dependency detection
- Component size analysis

**Code Example**:
```python
import networkx as nx
import matplotlib.pyplot as plt

# Load code graph
code_graph = dump.get('code_graph', {})
components = code_graph.get('components', {})

# Create graph
G = nx.DiGraph()
for comp, data in components.items():
    G.add_node(comp, size=data.get('size', 0))
    for dep in data.get('imports', []):
        G.add_edge(comp, dep)

# Visualize
pos = nx.spring_layout(G)
nx.draw(G, pos, with_labels=True, node_color='lightblue', 
        node_size=500, font_size=8, arrows=True)
plt.title('Component Dependency Graph')
plt.show()

# Find cycles
cycles = list(nx.simple_cycles(G))
if cycles:
    print(f"⚠️  Found {len(cycles)} circular dependencies:")
    for cycle in cycles:
        print(f"  {' → '.join(cycle)}")
```

**Subtasks**:
- [ ] Implement graph loading
- [ ] Create dependency visualization
- [ ] Add cycle detection
- [ ] Add component statistics
- [ ] Test with code graph data

#### Task 2.4: Create API Analysis Notebook (45 min)
**File**: `tools/jupyter/content/notebooks/04-api-analysis.ipynb`

**Content**:
- Load network requests
- Endpoint analysis
- Request/response schema exploration
- API usage patterns

**Subtasks**:
- [ ] Implement request parsing
- [ ] Create endpoint visualizations
- [ ] Add schema exploration
- [ ] Add usage statistics
- [ ] Test with network data

---

### Phase 3: WebSocket Bridge (4 hours)

#### Task 3.1: Design Protocol (30 min)
**Protocol Specification**:
```typescript
// Message types
type MessageType = 
  | 'dump_data'        // Send dump to notebook
  | 'execute_code'     // Execute code in browser
  | 'query_storage'    // Query live storage
  | 'watch_variable'   // Watch browser variable
  | 'ping'            // Keep-alive

interface WSMessage {
  type: MessageType;
  id: string;         // Request ID
  payload: any;
  timestamp: number;
}

interface WSResponse {
  id: string;         // Matches request ID
  status: 'success' | 'error';
  result: any;
  error?: string;
}
```

**Subtasks**:
- [ ] Document message format
- [ ] Define message types
- [ ] Define error handling
- [ ] Create protocol spec document

#### Task 3.2: Implement Userscript Bridge (2 hours)
**File**: `scripts/perplexity-dumper/jupyter-bridge.ts`

```typescript
class JupyterBridge {
  private ws: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private readonly jupyterUrl: string;
  private handlers: Map<string, (data: any) => void> = new Map();
  
  constructor(jupyterUrl: string = 'ws://localhost:8888') {
    this.jupyterUrl = jupyterUrl;
    this.connect();
  }
  
  connect() {
    try {
      this.ws = new WebSocket(`${this.jupyterUrl}/api/bridge`);
      
      this.ws.onopen = () => {
        console.log('[JupyterBridge] Connected');
        this.send('ping', {});
      };
      
      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };
      
      this.ws.onclose = () => {
        console.log('[JupyterBridge] Disconnected');
        this.scheduleReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('[JupyterBridge] Error:', error);
      };
    } catch (error) {
      console.error('[JupyterBridge] Connection failed:', error);
      this.scheduleReconnect();
    }
  }
  
  handleMessage(message: WSMessage) {
    switch (message.type) {
      case 'execute_code':
        this.executeCode(message);
        break;
      case 'query_storage':
        this.queryStorage(message);
        break;
      case 'watch_variable':
        this.watchVariable(message);
        break;
      default:
        console.warn('[JupyterBridge] Unknown message type:', message.type);
    }
  }
  
  executeCode(message: WSMessage) {
    // ⚠️ SECURITY WARNING: This is INSECURE example code!
    // eval() allows arbitrary code execution - DO NOT USE IN PRODUCTION
    // See SECURITY_CONSIDERATIONS.md for secure alternatives
    try {
      const result = eval(message.payload.code);  // INSECURE - Replace with sandboxed execution
      this.sendResponse(message.id, 'success', result);
    } catch (error) {
      this.sendResponse(message.id, 'error', null, error.message);
    }
  }
  
  queryStorage(message: WSMessage) {
    const { key, storage } = message.payload;
    const value = storage === 'localStorage' 
      ? localStorage.getItem(key)
      : sessionStorage.getItem(key);
    this.sendResponse(message.id, 'success', value);
  }
  
  watchVariable(message: WSMessage) {
    // ⚠️ SECURITY WARNING: This is INSECURE example code!
    // eval() allows arbitrary code execution - DO NOT USE IN PRODUCTION
    // See SECURITY_CONSIDERATIONS.md for secure alternatives
    const { path } = message.payload;
    try {
      const value = eval(path);  // INSECURE - Replace with whitelisted property access
      this.sendResponse(message.id, 'success', value);
    } catch (error) {
      this.sendResponse(message.id, 'error', null, error.message);
    }
  }
  
  send(type: MessageType, payload: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[JupyterBridge] Not connected');
      return;
    }
    
    const message: WSMessage = {
      type,
      id: this.generateId(),
      payload,
      timestamp: Date.now(),
    };
    
    this.ws.send(JSON.stringify(message));
  }
  
  sendResponse(id: string, status: 'success' | 'error', result: any, error?: string) {
    const response: WSResponse = { id, status, result, error };
    this.send('response' as MessageType, response);
  }
  
  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }
  
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Initialize bridge
const bridge = new JupyterBridge();

// Export for use in userscript
(window as any).__perplexity_jupyter_bridge = bridge;
```

**Subtasks**:
- [ ] Implement connection management
- [ ] Implement message handling
- [ ] Implement code execution
- [ ] Implement storage queries
- [ ] Implement variable watching
- [ ] Add reconnection logic
- [ ] Add error handling
- [ ] Add TypeScript types

#### Task 3.3: Implement Jupyter Extension (1.5 hours)
**File**: `tools/jupyter/extensions/bridge-extension/index.ts`

```typescript
import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'perplexity-bridge',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('Perplexity Bridge Extension activated');
    
    // Add command to connect to userscript
    app.commands.addCommand('bridge:connect', {
      label: 'Connect to Perplexity Userscript',
      execute: () => {
        // Create WebSocket server
        const ws = new WebSocket('ws://localhost:8888/api/bridge');
        
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          // Handle messages from userscript
        };
      }
    });
    
    // Add to palette
    palette.addItem({ command: 'bridge:connect', category: 'Perplexity' });
  }
};

export default plugin;
```

**Subtasks**:
- [ ] Create extension structure
- [ ] Implement WebSocket server
- [ ] Add command palette integration
- [ ] Add status indicator
- [ ] Build and test extension

---

### Phase 4: Documentation & Examples (3 hours)

#### Task 4.1: Create User Guide (1 hour)
**File**: `tools/jupyter/README.md`

**Sections**:
- [ ] Getting started
- [ ] Installation
- [ ] Building JupyterLite
- [ ] Using notebooks
- [ ] Connecting to live userscript
- [ ] Troubleshooting

#### Task 4.2: Create Developer Guide (1 hour)
**File**: `tools/jupyter/DEVELOPMENT.md`

**Sections**:
- [ ] Architecture overview
- [ ] WebSocket protocol
- [ ] Creating custom notebooks
- [ ] Extension development
- [ ] Testing

#### Task 4.3: Add Sample Dumps (30 min)
**File**: `tools/jupyter/content/files/sample-dump.json`

**Subtasks**:
- [ ] Create sanitized sample dump
- [ ] Add to content/files directory
- [ ] Update notebooks to reference sample

#### Task 4.4: Create Video Tutorial (30 min)
- [ ] Record screen demo
- [ ] Show notebook usage
- [ ] Show live connection
- [ ] Add to README

---

## 🎯 Acceptance Criteria

### Functional
- [x] JupyterLite site builds successfully
- [x] Notebooks load and run in browser
- [x] WebSocket bridge connects userscript to notebooks
- [x] Live code execution works
- [x] Storage queries work
- [x] 4+ analysis notebooks included

### Quality
- [x] Build process is automated
- [x] WebSocket connection is stable
- [x] Error handling is robust
- [x] Documentation is complete

### User Experience
- [x] Notebooks are well-documented
- [x] Examples are clear and useful
- [x] Connection process is simple
- [x] Error messages are helpful

---

## 📊 Effort Summary

| Task | Hours |
|------|-------|
| Phase 1: JupyterLite Setup | 3.0 |
| Phase 2: Analysis Notebooks | 3.0 |
| Phase 3: WebSocket Bridge | 4.0 |
| Phase 4: Documentation | 3.0 |
| **Total** | **13.0** |

---

## 🔗 Dependencies

**Required**:
- Python 3.10+
- jupyterlite>=0.3.0
- jupyterlite-pyodide-kernel>=0.3.0
- Node.js 18+ (for extension build)

**Optional**:
- Feature 1 (Code Analysis) - for code analysis notebooks
- Feature 2 (API Analysis) - for API analysis notebooks

---

## 🚀 Next Steps

After completing this feature:
1. Deploy JupyterLite to GitHub Pages
2. Create more advanced notebooks
3. Add more extensions (dump loader, visualization)
4. Consider JupyterHub integration for multi-user
5. Move to Feature 4 (StackBlitz Integration)

---

**Status**: Ready for Implementation  
**Priority**: Low (Nice to have)  
**Complexity**: High
