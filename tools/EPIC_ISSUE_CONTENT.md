# Epic: Dump Analyzer Enhancement Suite

## 🎯 Overview

**Epic for**: PR #16 Follow-ups  
**Context**: https://github.com/pv-udpv/perplexity-ai-plug/pull/16#issuecomment-3691655172

Comprehensive enhancement suite for the Perplexity Storage Dump Analyzer, adding advanced code analysis, API schema extraction, and interactive analysis capabilities.

---

## 📦 Features

This epic encompasses four major enhancements:

### 1. 🔍 TypeScript/JavaScript Analysis Enhancement
**Goal**: Deep code analysis with AST parsing, function/class extraction, and type inference.

**Key Capabilities**:
- Parse JavaScript/TypeScript with proper AST tools (esprima, TypeScript compiler)
- Extract all function and class definitions with signatures
- Infer and extract TypeScript types, interfaces, and enums
- Build complete dependency graph with circular dependency detection
- Identify entry points and orphaned modules

**Deliverables**:
- `tools/analyzers/js_ast_analyzer.py` - AST parsing engine
- `tools/analyzers/ts_type_extractor.py` - TypeScript type extraction
- `tools/analyzers/dependency_resolver.py` - Advanced dependency graph with NetworkX
- Enhanced code-graph output with functions, classes, types
- CLI flag: `--analyze-code --extract-types --detect-cycles`

**Output Example**:
```json
{
  "components": {
    "_app": {
      "functions": [
        {"name": "App", "type": "ArrowFunction", "params": ["props"], "returns": "JSX.Element"}
      ],
      "classes": [
        {"name": "AppState", "methods": ["constructor", "setState"]}
      ],
      "imports": {"react": ["useState", "useEffect"], "./Layout": ["default"]},
      "exports": {"default": "App"}
    }
  },
  "graph": {
    "cycles": [["A", "B", "A"]],
    "entry_points": ["_app"],
    "orphans": []
  }
}
```

**Success Criteria**:
- [ ] AST parsing for JavaScript with 95%+ success rate
- [ ] Function/class extraction working for React components
- [ ] TypeScript type extraction (interfaces, types, enums)
- [ ] Circular dependency detection
- [ ] Performance: <30s for 100 components
- [ ] Tests: 85%+ coverage

**Estimated Effort**: 7 hours

---

### 2. 🌐 API Schema Extraction & OpenAPI Generation
**Goal**: Network request analysis with OpenAPI spec generation and component-to-API mapping.

**Key Capabilities**:
- Parse and analyze all network requests from dumps
- Infer JSON schemas from request/response payloads
- Generate OpenAPI 3.0 specifications automatically
- Map components to the APIs they call
- Group requests by endpoint patterns (e.g., `/api/users/{id}`)

**Deliverables**:
- `tools/analyzers/network_analyzer.py` - Network request parsing
- `tools/analyzers/schema_inferencer.py` - JSON schema inference
- `tools/analyzers/openapi_generator.py` - OpenAPI 3.0 generation
- `tools/analyzers/component_api_mapper.py` - Component-to-API mapping
- CLI flag: `--extract-api-schema --generate-openapi --map-components-to-apis`

**Output Example**:
```json
{
  "openapi": "3.0.0",
  "info": {"title": "Perplexity API", "version": "1.0.0"},
  "paths": {
    "/api/threads": {
      "get": {
        "summary": "GET /api/threads",
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {"type": "object", "properties": {"id": {"type": "string"}}}
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

**Success Criteria**:
- [ ] Network request parsing with 95%+ success rate
- [ ] Schema inference from JSON payloads
- [ ] Valid OpenAPI 3.0 specification
- [ ] Component-to-API mapping working
- [ ] Tests: 85%+ coverage

**Estimated Effort**: 10 hours

---

### 3. 📓 JupyterLite Integration
**Goal**: Interactive runtime analysis with userscript communication for live debugging.

**Key Capabilities**:
- Web-based Jupyter notebook environment (no installation required)
- Pre-loaded analysis notebooks for common tasks
- WebSocket bridge to userscript for live runtime analysis
- Interactive visualizations with Plotly/Altair
- Custom JupyterLab extension for drag-and-drop dump loading

**Deliverables**:
- `tools/jupyter/notebooks/` - Pre-built analysis notebooks
  - `01-quick-start.ipynb` - Basic stats and visualization
  - `02-storage-analysis.ipynb` - Deep storage analysis
  - `03-code-analysis.ipynb` - Code dependency visualization
  - `04-api-analysis.ipynb` - API usage patterns
- `tools/jupyter/extensions/dump-loader/` - Custom JupyterLab extension
- `scripts/perplexity-dumper/jupyter-bridge.ts` - WebSocket bridge
- `tools/jupyter/build.py` - JupyterLite build script
- Deployed JupyterLite site (GitHub Pages or local)

**Usage Flow**:
1. User opens JupyterLite in browser
2. Drags dump JSON file into browser
3. Selects analysis template notebook
4. Runs cells to analyze dump
5. (Optional) Connects to live userscript for runtime analysis

**Example Notebook Cell**:
```python
import json
import plotly.express as px

# Load dump
dump = json.load(open('./dumps/perplexity-dump.json'))

# Visualize storage sizes
sizes = [len(json.dumps(v)) for v in dump['storage']['localStorage'].values()]
fig = px.histogram(sizes, title='localStorage Value Sizes')
fig.show()
```

**Success Criteria**:
- [ ] JupyterLite site deploys successfully
- [ ] Dump files load into notebooks
- [ ] WebSocket connection to userscript works
- [ ] 4+ analysis template notebooks
- [ ] Interactive visualizations working

**Estimated Effort**: 13 hours

---

### 4. ⚡ StackBlitz Integration
**Goal**: Web-based IDE for dump analysis with pre-configured analyzer environment.

**Key Capabilities**:
- Run analyzer in StackBlitz (no local setup required)
- Python WASM environment using Pyodide
- Multiple template projects for different analysis types
- Shareable URLs for team collaboration
- Embedded demos in documentation

**Deliverables**:
- `tools/stackblitz/templates/python-analyzer/` - Python WASM template
- `tools/stackblitz/templates/typescript-analyzer/` - TypeScript analyzer
- `tools/stackblitz/templates/jupyter-notebook/` - JupyterLite in StackBlitz
- Template gallery with 3+ variations:
  - Quick Analysis: Basic stats and charts
  - Deep Dive: Full analysis with code graph
  - API Explorer: API schema extraction
  - Comparative Analysis: Compare two dumps
- Shareable and embeddable projects

**Usage Flow**:
1. User clicks "Open in StackBlitz" button in docs
2. StackBlitz opens with pre-configured environment
3. User uploads dump.json file
4. Runs analysis scripts in browser
5. Shares link with team

**Example StackBlitz Config**:
```typescript
export default {
  title: 'Perplexity Dump Analyzer',
  description: 'Analyze Perplexity storage dumps in your browser',
  template: 'node',
  files: {
    'analyze-dump.py': `# Python analyzer code`,
    'dump.json': '{}', // Placeholder
  }
};
```

**Success Criteria**:
- [ ] StackBlitz project templates working
- [ ] Python WASM analyzer functional
- [ ] 3+ template variations available
- [ ] Shareable links working
- [ ] Embedded demos in documentation

**Estimated Effort**: 10 hours

---

## 📊 Summary

### Total Estimated Effort
| Feature | Effort |
|---------|--------|
| TypeScript/JS Analysis | 7 hours |
| API Schema Extraction | 10 hours |
| JupyterLite Integration | 13 hours |
| StackBlitz Integration | 10 hours |
| **Total** | **40 hours** (~1 week) |

### Implementation Order (Recommended)
1. **Feature 1** (TS/JS Analysis) - Builds on existing code graph
2. **Feature 2** (API Schema) - Uses network data already in dumps
3. **Feature 4** (StackBlitz) - Easier to deploy, no WebSocket needed
4. **Feature 3** (JupyterLite) - Most complex, requires WebSocket bridge

### Priority
- **High**: Feature 1 (TS/JS Analysis) - Immediate value
- **High**: Feature 2 (API Schema) - High user request
- **Medium**: Feature 4 (StackBlitz) - Good for onboarding
- **Low**: Feature 3 (JupyterLite) - Nice to have, complex

### Dependencies
```
Feature 1 → Feature 2 (API analysis needs code analysis)
Feature 3 ← Feature 1, 2 (Jupyter notebooks use both)
Feature 4 ← Feature 1, 2 (StackBlitz templates use both)
```

---

## 🏗️ Architecture

### New Files to Create
```
tools/
├── analyzers/
│   ├── js_ast_analyzer.py          # NEW - Feature 1
│   ├── ts_type_extractor.py        # NEW - Feature 1
│   ├── dependency_resolver.py      # NEW - Feature 1
│   ├── network_analyzer.py         # NEW - Feature 2
│   ├── schema_inferencer.py        # NEW - Feature 2
│   ├── openapi_generator.py        # NEW - Feature 2
│   └── component_api_mapper.py     # NEW - Feature 2
├── jupyter/
│   ├── notebooks/                   # NEW - Feature 3
│   │   ├── 01-quick-start.ipynb
│   │   ├── 02-storage-analysis.ipynb
│   │   ├── 03-code-analysis.ipynb
│   │   └── 04-api-analysis.ipynb
│   ├── extensions/dump-loader/      # NEW - Feature 3
│   ├── config/jupyter_config.py     # NEW - Feature 3
│   └── build.py                     # NEW - Feature 3
├── stackblitz/
│   ├── templates/                   # NEW - Feature 4
│   │   ├── python-analyzer/
│   │   ├── typescript-analyzer/
│   │   └── jupyter-notebook/
│   └── README.md
├── ENHANCEMENT_PLAN.md              # NEW - This document
└── requirements.txt                 # UPDATE - Add new deps

scripts/perplexity-dumper/
└── jupyter-bridge.ts                # NEW - Feature 3
```

### New Dependencies
```python
# Feature 1
esprima>=4.0.1
networkx>=3.0

# Feature 2
openapi-schema-validator>=3.0
jsonschema>=4.0
furl>=2.1
genson>=1.2

# Feature 3
jupyterlite>=0.3.0
jupyterlite-pyodide-kernel>=0.3.0

# Feature 4
(No Python deps - uses Pyodide in browser)
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] AST parser tests (Feature 1)
- [ ] Type extraction tests (Feature 1)
- [ ] Dependency resolver tests (Feature 1)
- [ ] Network analyzer tests (Feature 2)
- [ ] Schema inference tests (Feature 2)
- [ ] OpenAPI generation tests (Feature 2)
- [ ] WebSocket bridge tests (Feature 3)

### Integration Tests
- [ ] End-to-end analysis pipeline
- [ ] JupyterLite deployment
- [ ] StackBlitz templates
- [ ] Cross-feature interactions

### Target Coverage
- [ ] 85%+ coverage for all new analyzers
- [ ] 90%+ for core functionality

---

## 📋 Deliverables Checklist

### Feature 1: TS/JS Analysis
- [ ] AST parser implementation
- [ ] Type extractor implementation
- [ ] Dependency resolver with NetworkX
- [ ] Enhanced code graph output
- [ ] CLI integration
- [ ] Unit tests (85%+ coverage)
- [ ] Documentation

### Feature 2: API Schema
- [ ] Network analyzer implementation
- [ ] Schema inferencer implementation
- [ ] OpenAPI generator implementation
- [ ] Component-to-API mapper
- [ ] CLI integration
- [ ] Unit tests (85%+ coverage)
- [ ] Documentation

### Feature 3: JupyterLite
- [ ] JupyterLite site setup
- [ ] 4+ analysis notebooks
- [ ] WebSocket bridge to userscript
- [ ] Custom JupyterLab extension
- [ ] Build scripts
- [ ] Deployment configuration
- [ ] Documentation

### Feature 4: StackBlitz
- [ ] Python WASM template
- [ ] TypeScript analyzer template
- [ ] 3+ project variations
- [ ] Share/embed functionality
- [ ] Documentation with embedded demos

---

## 🚀 Success Criteria

### Functional
- [ ] All four features fully implemented
- [ ] CLI commands working for Features 1 & 2
- [ ] JupyterLite site deployed and accessible
- [ ] StackBlitz templates available and functional

### Quality
- [ ] 85%+ test coverage
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Performance targets met

### User Experience
- [ ] Clear documentation for each feature
- [ ] Easy to use interfaces
- [ ] Good error messages
- [ ] Examples for common use cases

---

## 📚 Related

- **Parent PR**: #16 - Fix analyzer crashes and type handling
- **Related Issue**: #14 - Python dump analyzer with selective export
- **Related Issue**: #12 - Perplexity Storage Dumper userscript

---

## 🗓️ Timeline

**Start Date**: TBD  
**Target Completion**: ~1 week after start  
**Status**: Planning Phase

---

**Priority**: High  
**Complexity**: High  
**Total Effort**: 40 hours (~1 week of focused work)  
**Labels**: `epic`, `enhancement`, `tooling`, `python`, `data-analysis`  
**Assignees**: @pv-udpv
