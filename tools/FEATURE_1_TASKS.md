# Feature 1: TypeScript/JavaScript Analysis Enhancement

## 🎯 Goal
Deep code analysis with AST parsing, function/class extraction, and type inference.

## 📋 Task Breakdown

### Phase 1: AST Parser (2 hours)

#### Task 1.1: Setup Dependencies (15 min)
- [ ] Add `esprima>=4.0.1` to requirements.txt
- [ ] Add `networkx>=3.0` to requirements.txt
- [ ] Update documentation with new dependencies
- [ ] Test installation on clean environment

#### Task 1.2: Create AST Analyzer (1 hour)
**File**: `tools/analyzers/js_ast_analyzer.py`

**Class Structure**:
```python
class JSASTAnalyzer:
    def __init__(self, code: str):
        self.code = code
        self.tree = None
    
    def parse(self) -> Dict:
        """Parse JavaScript with esprima."""
        pass
    
    def _extract_functions(self, tree) -> List[Dict]:
        """Extract function definitions with signatures."""
        pass
    
    def _extract_classes(self, tree) -> List[Dict]:
        """Extract class definitions with methods."""
        pass
    
    def _extract_imports(self, tree) -> Dict:
        """Extract import statements."""
        pass
    
    def _extract_exports(self, tree) -> Dict:
        """Extract export statements."""
        pass
```

**Subtasks**:
- [ ] Implement `parse()` method with esprima
- [ ] Implement `_extract_functions()` - handle FunctionDeclaration, ArrowFunctionExpression, FunctionExpression
- [ ] Implement `_extract_classes()` - handle ClassDeclaration, methods, properties
- [ ] Implement `_extract_imports()` - handle import statements, dynamic imports
- [ ] Implement `_extract_exports()` - handle export statements, default exports
- [ ] Add error handling for malformed JavaScript
- [ ] Add JSX support (`jsx: True` in esprima options)

#### Task 1.3: Unit Tests (45 min)
**File**: `tools/analyzers/test_js_ast_analyzer.py`

**Test Cases**:
- [ ] Test function extraction (regular, arrow, anonymous)
- [ ] Test class extraction (methods, properties, constructor)
- [ ] Test import extraction (named, default, namespace)
- [ ] Test export extraction (named, default)
- [ ] Test JSX parsing (React components)
- [ ] Test error handling (malformed JS)
- [ ] Test edge cases (empty file, comments only)

**Coverage Target**: 90%+

---

### Phase 2: TypeScript Integration (3 hours)

#### Task 2.1: Research TypeScript Extraction Methods (30 min)
**Options to evaluate**:
1. Node.js subprocess with `ts-morph` (most accurate)
2. Python `pyright` integration (static analysis)
3. Parse `.d.ts` files only (limited but fast)

**Decision**: Document chosen approach with rationale

#### Task 2.2: Implement TypeScript Extractor (1.5 hours)
**File**: `tools/analyzers/ts_type_extractor.py`

**Option A: Node.js subprocess approach**
```python
class TSTypeExtractor:
    def extract_types(self, code: str, filepath: str = None) -> Dict:
        """Extract TypeScript types via ts-morph."""
        # Write code to temp file
        # Call Node.js script with ts-morph
        # Parse JSON output
        pass
    
    def _extract_interfaces(self, ast) -> List[Dict]:
        """Extract interface definitions."""
        pass
    
    def _extract_type_aliases(self, ast) -> List[Dict]:
        """Extract type aliases."""
        pass
    
    def _extract_enums(self, ast) -> List[Dict]:
        """Extract enum definitions."""
        pass
```

**Node.js helper script**: `tools/analyzers/ts-extractor.js`
```javascript
const ts = require('typescript');
const fs = require('fs');

function extractTypes(code) {
  const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest);
  // Walk AST and extract types
  return {
    interfaces: [],
    types: [],
    enums: [],
  };
}

// CLI interface
const code = fs.readFileSync(process.argv[2], 'utf8');
console.log(JSON.stringify(extractTypes(code)));
```

**Subtasks**:
- [ ] Create Node.js helper script
- [ ] Implement subprocess call from Python
- [ ] Parse and validate JSON output
- [ ] Extract interfaces with properties and methods
- [ ] Extract type aliases
- [ ] Extract enums with values
- [ ] Handle TypeScript-specific syntax (generics, unions, intersections)

#### Task 2.3: Fallback for JavaScript (30 min)
- [ ] Detect if file is TS or JS
- [ ] Skip type extraction for plain JS files
- [ ] Add warning message for TS files without Node.js

#### Task 2.4: Unit Tests (30 min)
**File**: `tools/analyzers/test_ts_type_extractor.py`

**Test Cases**:
- [ ] Test interface extraction
- [ ] Test type alias extraction
- [ ] Test enum extraction
- [ ] Test generics handling
- [ ] Test union and intersection types
- [ ] Test nested types
- [ ] Test error handling (invalid TS)

**Coverage Target**: 85%+

---

### Phase 3: Dependency Resolver (2 hours)

#### Task 3.1: Install NetworkX (5 min)
- [ ] Verify `networkx>=3.0` in requirements.txt
- [ ] Test import in Python

#### Task 3.2: Implement Dependency Resolver (1.5 hours)
**File**: `tools/analyzers/dependency_resolver.py`

**Class Structure**:
```python
import networkx as nx

class DependencyResolver:
    def __init__(self, components: Dict[str, Dict]):
        self.components = components
        self.graph = nx.DiGraph()
    
    def build_graph(self) -> nx.DiGraph:
        """Build dependency graph from components."""
        pass
    
    def find_cycles(self) -> List[List[str]]:
        """Find circular dependencies."""
        pass
    
    def find_orphans(self) -> List[str]:
        """Find components with no imports or exports."""
        pass
    
    def find_entry_points(self) -> List[str]:
        """Find components with no incoming edges."""
        pass
    
    def get_dependency_tree(self, component: str) -> Dict:
        """Get full dependency tree for a component."""
        pass
    
    def export(self) -> Dict:
        """Export graph in JSON format."""
        pass
```

**Subtasks**:
- [ ] Implement `build_graph()` - add nodes and edges from components
- [ ] Implement `find_cycles()` - use `nx.simple_cycles()`
- [ ] Implement `find_orphans()` - components with no connections
- [ ] Implement `find_entry_points()` - nodes with in_degree == 0
- [ ] Implement `get_dependency_tree()` - BFS/DFS traversal
- [ ] Implement `export()` - convert to JSON with `nx.node_link_data()`

#### Task 3.3: Unit Tests (30 min)
**File**: `tools/analyzers/test_dependency_resolver.py`

**Test Cases**:
- [ ] Test graph building
- [ ] Test cycle detection (simple, complex)
- [ ] Test orphan detection
- [ ] Test entry point detection
- [ ] Test dependency tree generation
- [ ] Test export to JSON

**Coverage Target**: 90%+

---

### Integration Tasks

#### Task 4.1: Integrate with CodeGraphAnalyzer (30 min)
**File**: `tools/analyzers/code_graph.py` (modify existing)

**Changes**:
```python
from .js_ast_analyzer import JSASTAnalyzer
from .ts_type_extractor import TSTypeExtractor
from .dependency_resolver import DependencyResolver

class CodeGraphAnalyzer:
    def analyze(self) -> Dict[str, Any]:
        """Extract code graph from cached JS."""
        # Existing code...
        
        # NEW: Add AST analysis
        for file_key, file_data in self.files.items():
            code = file_data.get('code', '')
            if code:
                ast_analyzer = JSASTAnalyzer(code)
                ast_data = ast_analyzer.parse()
                file_data['functions'] = ast_data['functions']
                file_data['classes'] = ast_data['classes']
                
                # TypeScript type extraction
                if file_key.endswith('.ts') or file_key.endswith('.tsx'):
                    ts_extractor = TSTypeExtractor()
                    type_data = ts_extractor.extract_types(code)
                    file_data['types'] = type_data
        
        # NEW: Add dependency resolution
        resolver = DependencyResolver(self.files)
        graph = resolver.build_graph()
        
        return {
            'components': self.files,
            'graph': resolver.export(),
            'cycles': resolver.find_cycles(),
            'orphans': resolver.find_orphans(),
            'entry_points': resolver.find_entry_points(),
            'stats': {
                'total_components': len(self.files),
                'total_dependencies': sum(len(deps) for deps in self.imports.values()),
                'circular_dependencies': len(resolver.find_cycles()),
            }
        }
```

**Subtasks**:
- [ ] Import new analyzers
- [ ] Integrate AST parsing into existing flow
- [ ] Add TypeScript type extraction
- [ ] Integrate dependency resolver
- [ ] Update output format
- [ ] Maintain backward compatibility

#### Task 4.2: CLI Integration (30 min)
**File**: `tools/analyze-dump.py` (modify existing)

**Changes**:
```python
@click.option('--analyze-code', is_flag=True, help='Perform deep code analysis with AST parsing')
@click.option('--extract-types', is_flag=True, help='Extract TypeScript types (requires Node.js)')
@click.option('--detect-cycles', is_flag=True, help='Detect circular dependencies')
def main(dump_file, analyze_code, extract_types, detect_cycles, ...):
    # Existing code...
    
    if analyze_code or extract_types or detect_cycles:
        analyzer = CodeGraphAnalyzer(dump_data)
        code_graph = analyzer.analyze()
        
        if detect_cycles and code_graph.get('cycles'):
            console.print('[yellow]⚠️  Circular dependencies detected:[/yellow]')
            for cycle in code_graph['cycles']:
                console.print(f'  {" → ".join(cycle)}')
        
        # Export enhanced code graph
        output_path = Path(output) / 'code-graph-enhanced.json'
        with open(output_path, 'w') as f:
            json.dump(code_graph, f, indent=2)
```

**Subtasks**:
- [ ] Add new CLI flags
- [ ] Integrate with existing analysis flow
- [ ] Add console output for cycles/orphans
- [ ] Export enhanced code graph
- [ ] Update help text

#### Task 4.3: Documentation (30 min)
**Files to update**:
- `tools/README.md` - Add new features section
- `tools/EXAMPLES.md` - Add usage examples
- `CHANGELOG.md` - Document changes

**Documentation sections**:
- [ ] Feature overview
- [ ] CLI usage examples
- [ ] Output format documentation
- [ ] TypeScript requirements (Node.js)
- [ ] Performance notes
- [ ] Troubleshooting

---

## 🎯 Acceptance Criteria

### Functional
- [x] AST parsing for JavaScript with 95%+ success rate
- [x] Function/class extraction working for React components
- [x] TypeScript type extraction (interfaces, types, enums)
- [x] Circular dependency detection
- [x] Orphan module detection
- [x] Entry point detection

### Performance
- [x] Processing time: <30s for 100 components
- [x] Memory usage: <500MB for typical dumps

### Quality
- [x] Test coverage: 85%+ overall
- [x] AST analyzer: 90%+ coverage
- [x] Dependency resolver: 90%+ coverage
- [x] TypeScript extractor: 85%+ coverage

### Documentation
- [x] README updated with new features
- [x] Examples added for each use case
- [x] API documentation complete

---

## 📊 Effort Summary

| Task | Hours |
|------|-------|
| Phase 1: AST Parser | 2.0 |
| Phase 2: TypeScript Integration | 3.0 |
| Phase 3: Dependency Resolver | 2.0 |
| Integration & CLI | 1.0 |
| Testing & Documentation | 1.0 |
| **Total** | **7.0** |

---

## 🔗 Dependencies

**Required**:
- Python 3.10+
- esprima>=4.0.1
- networkx>=3.0

**Optional**:
- Node.js 18+ (for TypeScript type extraction)
- npm packages: `typescript`, `ts-morph`

---

## 🚀 Next Steps

After completing this feature:
1. Test with real Perplexity dumps
2. Collect user feedback
3. Move to Feature 2 (API Schema Extraction)
4. Consider additional enhancements (JSDoc parsing, flow types)

---

**Status**: Ready for Implementation  
**Priority**: High  
**Complexity**: Medium-High
