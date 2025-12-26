# Dump Analyzer Enhancement Plan

## 🎯 Overview

This document outlines the implementation plan for four major enhancements to the Perplexity Storage Dump Analyzer, as discussed in [PR #16](https://github.com/pv-udpv/perplexity-ai-plug/pull/16).

## 📋 Enhancement Features

### 1. TypeScript/JavaScript Analysis Enhancement
**Goal**: Deep code analysis with AST parsing, function/class extraction, and type inference.

### 2. API Schema Extraction
**Goal**: Network request analysis with OpenAPI spec generation and component-to-API mapping.

### 3. JupyterLite Integration
**Goal**: Interactive runtime analysis with userscript communication for live debugging.

### 4. StackBlitz Integration
**Goal**: Web-based IDE for dump analysis with pre-configured analyzer environment.

---

## 🏗️ Feature 1: TypeScript/JavaScript Analysis Enhancement

### Current State
- Basic import extraction from cached JavaScript files
- Simple regex-based parsing
- Limited to import statements only

### Enhancement Goals
- **AST Parsing**: Parse JavaScript/TypeScript with proper AST tools
- **Function/Class Extraction**: Identify all function and class definitions
- **Type Inference**: Extract TypeScript types and interfaces
- **Export Analysis**: Track what each module exports
- **Dependency Resolution**: Build complete dependency graph with circular detection

### Technical Approach

#### Dependencies
```python
# Add to requirements.txt
esprima>=4.0.1           # JavaScript AST parser
typescript>=5.0          # TypeScript type extraction (via subprocess)
@typescript-eslint/typescript-estree  # TS AST parser (Node.js)
```

#### Architecture
```
tools/analyzers/
├── code_graph.py            # Existing (refactor)
├── js_ast_analyzer.py       # NEW - AST parsing
├── ts_type_extractor.py     # NEW - TypeScript types
└── dependency_resolver.py   # NEW - Advanced dependency graph
```

#### Implementation Phases

**Phase 1: AST Parser (2 hours)**
```python
class JSASTAnalyzer:
    def parse_file(self, code: str) -> Dict:
        """Parse JavaScript with esprima."""
        tree = esprima.parse(code, options={'jsx': True, 'tolerant': True})
        return {
            'functions': self._extract_functions(tree),
            'classes': self._extract_classes(tree),
            'imports': self._extract_imports(tree),
            'exports': self._extract_exports(tree),
        }
    
    def _extract_functions(self, tree) -> List[Dict]:
        """Extract function definitions with signatures."""
        # Walk AST for FunctionDeclaration, ArrowFunction, etc.
        pass
    
    def _extract_classes(self, tree) -> List[Dict]:
        """Extract class definitions with methods."""
        # Walk AST for ClassDeclaration
        pass
```

**Phase 2: TypeScript Integration (3 hours)**
```python
class TSTypeExtractor:
    def extract_types(self, code: str) -> Dict:
        """Extract TypeScript types via tsc API."""
        # Option 1: Call Node.js subprocess with ts-morph
        # Option 2: Use pyright for static analysis
        # Option 3: Parse .d.ts files only
        return {
            'interfaces': [],
            'types': [],
            'enums': [],
        }
```

**Phase 3: Advanced Dependency Graph (2 hours)**
```python
class DependencyResolver:
    def resolve(self, components: Dict) -> Dict:
        """Build complete dependency graph with circular detection."""
        graph = nx.DiGraph()  # Use NetworkX
        
        # Add nodes and edges
        for component, data in components.items():
            graph.add_node(component, **data)
            for dep in data['imports']:
                graph.add_edge(component, dep)
        
        return {
            'graph': nx.node_link_data(graph),
            'cycles': list(nx.simple_cycles(graph)),
            'orphans': self._find_orphans(graph),
            'entry_points': self._find_entry_points(graph),
        }
```

#### Output Format
```json
{
  "components": {
    "_app": {
      "url": "https://.../app.js",
      "size": 12345,
      "functions": [
        {
          "name": "App",
          "type": "ArrowFunction",
          "params": ["props"],
          "returns": "JSX.Element",
          "line": 42
        }
      ],
      "classes": [
        {
          "name": "AppState",
          "methods": ["constructor", "setState"],
          "properties": ["state", "props"]
        }
      ],
      "imports": {
        "react": ["useState", "useEffect"],
        "./Layout": ["default"]
      },
      "exports": {
        "default": "App"
      }
    }
  },
  "graph": {
    "nodes": [...],
    "edges": [...],
    "cycles": [["A", "B", "A"]],
    "entry_points": ["_app"]
  }
}
```

#### CLI Integration
```bash
# Enhanced code analysis
python tools/analyze-dump.py dump.json \
  --analyze-code \
  --extract-types \
  --detect-cycles \
  --output ./code-analysis

# Output files:
# - code-graph-enhanced.json (with AST data)
# - types.json (TypeScript types)
# - dependency-report.md (cycles, orphans, etc.)
```

### Success Criteria
- [ ] AST parsing for JavaScript with 95%+ success rate
- [ ] Function/class extraction working for React components
- [ ] TypeScript type extraction (at least interfaces and types)
- [ ] Circular dependency detection
- [ ] Performance: <30s for 100 components
- [ ] Tests: 85%+ coverage

### Estimated Effort
**Total: 7 hours**
- AST Parser: 2 hours
- TypeScript Integration: 3 hours
- Dependency Resolver: 2 hours

---

## 🏗️ Feature 2: API Schema Extraction

### Current State
- No network request analysis
- No API schema extraction
- No component-to-API mapping

### Enhancement Goals
- **Request Analysis**: Parse all network requests from dump
- **Schema Inference**: Infer request/response schemas from payloads
- **OpenAPI Generation**: Generate OpenAPI 3.0 specification
- **Component Mapping**: Map which components call which APIs

### Technical Approach

#### Dependencies
```python
# Add to requirements.txt
openapi-schema-validator>=3.0  # OpenAPI validation
jsonschema>=4.0                # JSON schema inference
furl>=2.1                      # URL parsing
```

#### Architecture
```
tools/analyzers/
├── network_analyzer.py      # NEW - Network request parsing
├── schema_inferencer.py     # NEW - Schema inference
└── openapi_generator.py     # NEW - OpenAPI spec generation
```

#### Implementation Phases

**Phase 1: Network Analyzer (2 hours)**
```python
class NetworkAnalyzer:
    def analyze(self, dump: Dict) -> Dict:
        """Extract and analyze network requests."""
        requests = dump.get('network', {}).get('requests', [])
        
        endpoints = defaultdict(list)
        for req in requests:
            endpoint = self._normalize_endpoint(req['url'])
            endpoints[endpoint].append({
                'method': req['method'],
                'request': req.get('postData'),
                'response': req.get('response', {}).get('body'),
                'status': req.get('response', {}).get('status'),
                'timestamp': req.get('timestamp'),
            })
        
        return {
            'endpoints': endpoints,
            'stats': {
                'total_requests': len(requests),
                'unique_endpoints': len(endpoints),
                'methods': self._count_methods(requests),
            }
        }
    
    def _normalize_endpoint(self, url: str) -> str:
        """Convert URL to endpoint pattern (e.g., /api/users/{id})."""
        # Replace UUIDs, numbers with placeholders
        parsed = furl(url)
        path = parsed.path.segments
        normalized = []
        for segment in path:
            if self._is_uuid(segment):
                normalized.append('{id}')
            elif segment.isdigit():
                normalized.append('{id}')
            else:
                normalized.append(segment)
        return '/' + '/'.join(normalized)
```

**Phase 2: Schema Inference (3 hours)**
```python
class SchemaInferencer:
    def infer_schema(self, samples: List[Any]) -> Dict:
        """Infer JSON schema from multiple samples."""
        # Use genson or custom logic
        from genson import SchemaBuilder
        
        builder = SchemaBuilder()
        for sample in samples:
            if sample:
                builder.add_object(sample)
        
        return builder.to_schema()
```

**Phase 3: OpenAPI Generator (3 hours)**
```python
class OpenAPIGenerator:
    def generate(self, network_data: Dict, components: Dict) -> Dict:
        """Generate OpenAPI 3.0 specification."""
        spec = {
            'openapi': '3.0.0',
            'info': {
                'title': 'Perplexity API',
                'version': '1.0.0',
                'description': 'Auto-generated from dump analysis',
            },
            'servers': [
                {'url': 'https://www.perplexity.ai'}
            ],
            'paths': {}
        }
        
        for endpoint, requests in network_data['endpoints'].items():
            spec['paths'][endpoint] = self._generate_path_item(endpoint, requests)
        
        return spec
    
    def _generate_path_item(self, endpoint: str, requests: List[Dict]) -> Dict:
        """Generate OpenAPI path item from requests."""
        methods = {}
        for method in set(r['method'] for r in requests):
            method_requests = [r for r in requests if r['method'] == method]
            
            # Infer request schema
            request_bodies = [r['request'] for r in method_requests if r.get('request')]
            request_schema = self.schema_inferencer.infer_schema(request_bodies)
            
            # Infer response schema
            response_bodies = [r['response'] for r in method_requests if r.get('response')]
            response_schema = self.schema_inferencer.infer_schema(response_bodies)
            
            methods[method.lower()] = {
                'summary': f'{method} {endpoint}',
                'requestBody': {
                    'content': {
                        'application/json': {
                            'schema': request_schema
                        }
                    }
                },
                'responses': {
                    '200': {
                        'description': 'Success',
                        'content': {
                            'application/json': {
                                'schema': response_schema
                            }
                        }
                    }
                }
            }
        
        return methods
```

**Phase 4: Component-to-API Mapping (2 hours)**
```python
class ComponentAPIMapper:
    def map(self, components: Dict, network_data: Dict) -> Dict:
        """Map components to APIs they call."""
        # Search for fetch/axios calls in component code
        # Match request patterns to endpoints
        mapping = defaultdict(set)
        
        for component, data in components.items():
            code = data.get('code', '')
            # Search for fetch/axios calls
            api_calls = self._extract_api_calls(code)
            for api_call in api_calls:
                endpoint = self._match_endpoint(api_call, network_data['endpoints'])
                if endpoint:
                    mapping[component].add(endpoint)
        
        return {k: list(v) for k, v in mapping.items()}
```

#### Output Format
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Perplexity API",
    "version": "1.0.0"
  },
  "paths": {
    "/api/threads": {
      "get": {
        "summary": "GET /api/threads",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {"type": "string"},
                      "title": {"type": "string"}
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

```json
{
  "component_api_map": {
    "ThreadList": ["/api/threads", "/api/threads/{id}"],
    "MessageView": ["/api/messages/{id}"]
  }
}
```

#### CLI Integration
```bash
python tools/analyze-dump.py dump.json \
  --extract-api-schema \
  --generate-openapi \
  --map-components-to-apis \
  --output ./api-analysis

# Output files:
# - openapi-spec.json (OpenAPI 3.0)
# - component-api-map.json
# - api-analysis-report.md
```

### Success Criteria
- [ ] Network request parsing with 95%+ success rate
- [ ] Schema inference from JSON payloads
- [ ] Valid OpenAPI 3.0 specification
- [ ] Component-to-API mapping working
- [ ] Tests: 85%+ coverage

### Estimated Effort
**Total: 10 hours**
- Network Analyzer: 2 hours
- Schema Inference: 3 hours
- OpenAPI Generator: 3 hours
- Component Mapping: 2 hours

---

## 🏗️ Feature 3: JupyterLite Integration

### Current State
- CLI-only tool
- No interactive analysis
- No live runtime connection

### Enhancement Goals
- **Interactive Notebook**: Web-based Jupyter notebook for analysis
- **Live Connection**: WebSocket connection to userscript for runtime analysis
- **Pre-loaded Dumps**: Auto-load dumps into notebook environment
- **Analysis Templates**: Pre-built notebooks for common analysis tasks

### Technical Approach

#### Dependencies
```python
# Add to requirements.txt
jupyterlite>=0.3.0          # JupyterLite core
jupyterlite-pyodide-kernel>=0.3.0  # Python kernel
```

#### Architecture
```
tools/jupyter/
├── notebooks/
│   ├── 01-quick-start.ipynb
│   ├── 02-storage-analysis.ipynb
│   ├── 03-code-analysis.ipynb
│   └── 04-api-analysis.ipynb
├── extensions/
│   └── dump-loader/         # Custom JupyterLab extension
├── config/
│   └── jupyter_config.py
└── build.py                 # Build JupyterLite site
```

```
scripts/perplexity-dumper/
└── jupyter-bridge.ts        # WebSocket bridge to JupyterLite
```

#### Implementation Phases

**Phase 1: JupyterLite Setup (3 hours)**
```bash
# Build JupyterLite site
cd tools/jupyter
pip install -r requirements.txt
jupyter lite build --output-dir ./dist

# Deploy to GitHub Pages or local server
```

```python
# notebooks/01-quick-start.ipynb
import json
from pathlib import Path

# Load dump (pre-uploaded or via file picker)
dump_path = Path('./dumps/perplexity-dump.json')
dump = json.load(dump_path.open())

# Quick stats
print(f"Storage keys: {len(dump['storage']['localStorage'])}")
print(f"IndexedDB databases: {len(dump['indexedDB'])}")

# Visualize with plotly
import plotly.express as px
sizes = [len(json.dumps(v)) for v in dump['storage']['localStorage'].values()]
fig = px.histogram(sizes, title='localStorage Value Sizes')
fig.show()
```

**Phase 2: WebSocket Bridge (4 hours)**
```typescript
// scripts/perplexity-dumper/jupyter-bridge.ts
class JupyterBridge {
  private ws: WebSocket | null = null;
  
  constructor(private jupyterUrl: string) {
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket(`${this.jupyterUrl}/api/kernels/ws`);
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }
  
  sendDump(dump: DumpData) {
    // Send dump to Jupyter kernel
    this.ws?.send(JSON.stringify({
      type: 'execute_request',
      content: {
        code: `dump = ${JSON.stringify(dump)}`,
      }
    }));
  }
  
  executeLiveQuery(code: string) {
    // Execute code against live browser state
    const result = eval(code);
    this.ws?.send(JSON.stringify({
      type: 'execute_result',
      content: { data: result }
    }));
  }
}
```

**Phase 3: Analysis Templates (3 hours)**
Create pre-built notebooks for common tasks:
- Storage analysis
- Code dependency visualization
- API usage patterns
- Performance profiling

**Phase 4: Custom Extension (3 hours)**
```typescript
// tools/jupyter/extensions/dump-loader/
// JupyterLab extension for drag-and-drop dump loading
import { JupyterFrontEnd } from '@jupyterlab/application';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

export const dumpLoaderPlugin = {
  id: 'dump-loader',
  autoStart: true,
  activate: (app: JupyterFrontEnd, factory: IFileBrowserFactory) => {
    // Add drop zone for dump files
    // Auto-parse and load into kernel
  }
};
```

#### Output Format
```
tools/jupyter/dist/
├── index.html              # JupyterLite app
├── lab/                    # JupyterLab interface
├── notebooks/              # Pre-loaded notebooks
└── files/                  # Sample dumps
```

#### Usage Flow
1. User opens JupyterLite in browser
2. Drags dump JSON file into browser
3. Selects analysis template notebook
4. Runs cells to analyze dump
5. (Optional) Connects to live userscript for runtime analysis

### Success Criteria
- [ ] JupyterLite site deploys successfully
- [ ] Dump files load into notebooks
- [ ] WebSocket connection to userscript works
- [ ] 4+ analysis template notebooks
- [ ] Interactive visualizations working

### Estimated Effort
**Total: 13 hours**
- JupyterLite Setup: 3 hours
- WebSocket Bridge: 4 hours
- Analysis Templates: 3 hours
- Custom Extension: 3 hours

---

## 🏗️ Feature 4: StackBlitz Integration

### Current State
- Local Python tool only
- Requires Python installation
- No web-based access

### Enhancement Goals
- **Web-Based IDE**: Run analyzer in StackBlitz (no local setup)
- **Pre-configured Environment**: Auto-install dependencies
- **Template Projects**: Ready-to-use analysis projects
- **Share Links**: Share analysis with team via URL

### Technical Approach

#### Architecture
```
tools/stackblitz/
├── templates/
│   ├── python-analyzer/     # Python WASM environment
│   ├── typescript-analyzer/ # TypeScript-based analyzer
│   └── jupyter-notebook/    # JupyterLite in StackBlitz
├── config/
│   └── stackblitz.config.ts
└── README.md
```

#### Implementation Phases

**Phase 1: StackBlitz Project Templates (2 hours)**
```typescript
// tools/stackblitz/templates/python-analyzer/stackblitz.config.ts
export default {
  title: 'Perplexity Dump Analyzer',
  description: 'Analyze Perplexity storage dumps in your browser',
  template: 'node',
  files: {
    'analyze-dump.py': `
import json
from pathlib import Path

def analyze(dump_path):
    with open(dump_path) as f:
        dump = json.load(f)
    # Analysis code
`,
    'package.json': {
      scripts: {
        analyze: 'python analyze-dump.py dump.json'
      }
    },
    'dump.json': '{}', // Placeholder
  }
};
```

**Phase 2: Python WASM Integration (4 hours)**
```html
<!-- Use Pyodide for Python in browser -->
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"></script>
</head>
<body>
  <script>
    async function runPythonAnalyzer() {
      let pyodide = await loadPyodide();
      await pyodide.loadPackage(['micropip']);
      
      // Install dependencies
      await pyodide.runPythonAsync(`
        import micropip
        await micropip.install(['rich', 'click'])
      `);
      
      // Load analyzer
      await pyodide.runPythonAsync(analyzerCode);
      
      // Run analysis
      const result = await pyodide.runPythonAsync(`
        analyze_dump('dump.json')
      `);
      
      console.log(result);
    }
  </script>
</body>
</html>
```

**Phase 3: Template Gallery (2 hours)**
Create multiple templates:
- **Quick Analysis**: Basic stats and charts
- **Deep Dive**: Full analysis with code graph
- **API Explorer**: API schema extraction
- **Comparative Analysis**: Compare two dumps

**Phase 4: Share & Embed (2 hours)**
```typescript
// Generate shareable links
const stackblitzUrl = `https://stackblitz.com/edit/perplexity-analyzer?file=dump.json`;

// Embed in documentation
<iframe 
  src="https://stackblitz.com/edit/perplexity-analyzer?embed=1"
  style="width:100%; height:500px;"
></iframe>
```

#### Usage Flow
1. User clicks "Open in StackBlitz" button in docs
2. StackBlitz opens with pre-configured environment
3. User uploads dump.json file
4. Runs analysis scripts in browser
5. Shares link with team

### Success Criteria
- [ ] StackBlitz project templates working
- [ ] Python WASM analyzer functional
- [ ] 3+ template variations available
- [ ] Shareable links working
- [ ] Embedded demos in documentation

### Estimated Effort
**Total: 10 hours**
- Project Templates: 2 hours
- Python WASM Integration: 4 hours
- Template Gallery: 2 hours
- Share & Embed: 2 hours

---

## 📊 Summary

### Total Estimated Effort
- **Feature 1** (TS/JS Analysis): 7 hours
- **Feature 2** (API Schema): 10 hours
- **Feature 3** (JupyterLite): 13 hours
- **Feature 4** (StackBlitz): 10 hours
- **Total**: **40 hours** (~1 week of focused work)

### Implementation Order (Recommended)
1. **Feature 1** (TS/JS Analysis) - Builds on existing code graph
2. **Feature 2** (API Schema) - Uses network data already in dumps
3. **Feature 4** (StackBlitz) - Easier to deploy, no WebSocket needed
4. **Feature 3** (JupyterLite) - Most complex, requires WebSocket bridge

### Dependencies
```
Feature 1 → Feature 2 (API analysis needs code analysis)
Feature 3 ← Feature 1, 2 (Jupyter notebooks use both)
Feature 4 ← Feature 1, 2 (StackBlitz templates use both)
```

### Priority
1. **High**: Feature 1 (TS/JS Analysis) - Immediate value
2. **High**: Feature 2 (API Schema) - High user request
3. **Medium**: Feature 4 (StackBlitz) - Good for onboarding
4. **Low**: Feature 3 (JupyterLite) - Nice to have, complex

---

## 🚀 Next Steps

1. **Create Epic Issue** - Document all four features
2. **Create Sub-Issues** - One issue per feature with detailed tasks
3. **Prioritize** - Start with Feature 1 (TS/JS Analysis)
4. **Implement** - Follow phases outlined above
5. **Test** - Comprehensive testing for each feature
6. **Document** - Update README and examples
7. **Release** - Tag version with new features

---

**Last Updated**: 2025-12-25  
**Status**: Planning Phase  
**Owner**: @pv-udpv
