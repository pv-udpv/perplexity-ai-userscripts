# Feature 2: API Schema Extraction & OpenAPI Generation

## 🎯 Goal
Network request analysis with OpenAPI spec generation and component-to-API mapping.

## 📋 Task Breakdown

### Phase 1: Network Analyzer (2 hours)

#### Task 1.1: Setup Dependencies (10 min)
- [ ] Add `furl>=2.1` to requirements.txt (URL parsing)
- [ ] Add `jsonschema>=4.0` to requirements.txt
- [ ] Update documentation with new dependencies

#### Task 1.2: Create Network Analyzer (1.5 hours)
**File**: `tools/analyzers/network_analyzer.py`

**Class Structure**:
```python
from collections import defaultdict
from typing import Dict, List, Any
from furl import furl
import re

class NetworkAnalyzer:
    def __init__(self, data: Dict[str, Any]):
        self.data = data.get('network', {})
        self.endpoints = defaultdict(list)
    
    def analyze(self) -> Dict[str, Any]:
        """Extract and analyze network requests."""
        pass
    
    def _normalize_endpoint(self, url: str) -> str:
        """Convert URL to endpoint pattern (e.g., /api/users/{id})."""
        pass
    
    def _is_uuid(self, segment: str) -> bool:
        """Check if segment is a UUID."""
        pass
    
    def _group_by_endpoint(self, requests: List[Dict]) -> Dict:
        """Group requests by normalized endpoint."""
        pass
    
    def _count_methods(self, requests: List[Dict]) -> Dict[str, int]:
        """Count requests by HTTP method."""
        pass
    
    def _extract_query_params(self, requests: List[Dict]) -> Dict:
        """Extract common query parameters per endpoint."""
        pass
```

**Subtasks**:
- [ ] Implement `analyze()` - main entry point
- [ ] Implement `_normalize_endpoint()` - replace IDs with placeholders:
  - UUIDs → `{id}`
  - Numeric IDs → `{id}`
  - Timestamps → `{timestamp}`
  - Hashes → `{hash}`
- [ ] Implement `_is_uuid()` - detect UUID format
- [ ] Implement `_group_by_endpoint()` - group similar requests
- [ ] Implement `_count_methods()` - GET, POST, PUT, DELETE, PATCH
- [ ] Implement `_extract_query_params()` - common params per endpoint
- [ ] Add URL parsing with error handling

#### Task 1.3: Unit Tests (30 min)
**File**: `tools/analyzers/test_network_analyzer.py`

**Test Cases**:
- [ ] Test endpoint normalization (UUIDs, numbers, mixed)
- [ ] Test UUID detection
- [ ] Test request grouping
- [ ] Test method counting
- [ ] Test query parameter extraction
- [ ] Test edge cases (malformed URLs, empty requests)

**Coverage Target**: 90%+

---

### Phase 2: Schema Inference (3 hours)

#### Task 2.1: Setup Dependencies (10 min)
- [ ] Add `genson>=1.2` to requirements.txt (schema inference)
- [ ] Test installation

#### Task 2.2: Create Schema Inferencer (2 hours)
**File**: `tools/analyzers/schema_inferencer.py`

**Class Structure**:
```python
from genson import SchemaBuilder
from typing import List, Any, Dict
import json

class SchemaInferencer:
    def __init__(self):
        self.builder = SchemaBuilder()
    
    def infer_schema(self, samples: List[Any]) -> Dict:
        """Infer JSON schema from multiple samples."""
        pass
    
    def infer_from_strings(self, samples: List[str]) -> Dict:
        """Infer schema from JSON strings."""
        pass
    
    def merge_schemas(self, schemas: List[Dict]) -> Dict:
        """Merge multiple schemas into one."""
        pass
    
    def simplify_schema(self, schema: Dict) -> Dict:
        """Simplify schema by removing redundant information."""
        pass
    
    def add_examples(self, schema: Dict, samples: List[Any], max_examples: int = 3) -> Dict:
        """Add example values to schema."""
        pass
```

**Subtasks**:
- [ ] Implement `infer_schema()` - use genson for inference
- [ ] Implement `infer_from_strings()` - parse JSON strings first
- [ ] Implement `merge_schemas()` - combine schemas from multiple samples
- [ ] Implement `simplify_schema()` - remove verbose genson output
- [ ] Implement `add_examples()` - add example values to schema
- [ ] Handle nested objects and arrays
- [ ] Handle mixed types (union types)
- [ ] Handle null values

**Schema Format**:
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
      "examples": ["550e8400-e29b-41d4-a716-446655440000"]
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 256,
      "examples": ["How to learn Rust"]
    }
  },
  "required": ["id", "title"]
}
```

#### Task 2.3: Unit Tests (50 min)
**File**: `tools/analyzers/test_schema_inferencer.py`

**Test Cases**:
- [ ] Test schema inference from objects
- [ ] Test schema inference from arrays
- [ ] Test schema inference from mixed types
- [ ] Test schema merging (multiple samples)
- [ ] Test schema simplification
- [ ] Test example addition
- [ ] Test edge cases (empty, null, nested)

**Coverage Target**: 85%+

---

### Phase 3: OpenAPI Generator (3 hours)

#### Task 3.1: Setup Dependencies (10 min)
- [ ] Add `openapi-schema-validator>=3.0` to requirements.txt
- [ ] Test installation

#### Task 3.2: Create OpenAPI Generator (2 hours)
**File**: `tools/analyzers/openapi_generator.py`

**Class Structure**:
```python
from typing import Dict, List, Any
from .schema_inferencer import SchemaInferencer
from openapi_schema_validator import validate

class OpenAPIGenerator:
    VERSION = '3.0.0'
    
    def __init__(self, base_url: str = 'https://www.perplexity.ai'):
        self.base_url = base_url
        self.schema_inferencer = SchemaInferencer()
    
    def generate(self, network_data: Dict, title: str = 'Perplexity API') -> Dict:
        """Generate OpenAPI 3.0 specification."""
        pass
    
    def _generate_path_item(self, endpoint: str, requests: List[Dict]) -> Dict:
        """Generate OpenAPI path item from requests."""
        pass
    
    def _generate_operation(self, method: str, requests: List[Dict]) -> Dict:
        """Generate OpenAPI operation object."""
        pass
    
    def _infer_request_body(self, requests: List[Dict]) -> Dict:
        """Infer request body schema."""
        pass
    
    def _infer_responses(self, requests: List[Dict]) -> Dict:
        """Infer response schemas by status code."""
        pass
    
    def _extract_path_parameters(self, endpoint: str) -> List[Dict]:
        """Extract path parameters from endpoint pattern."""
        pass
    
    def validate(self, spec: Dict) -> bool:
        """Validate OpenAPI specification."""
        pass
```

**Subtasks**:
- [ ] Implement `generate()` - create OpenAPI spec structure
- [ ] Implement `_generate_path_item()` - create path object
- [ ] Implement `_generate_operation()` - create operation object
- [ ] Implement `_infer_request_body()` - schema from POST/PUT/PATCH bodies
- [ ] Implement `_infer_responses()` - schemas by status code (200, 400, 500)
- [ ] Implement `_extract_path_parameters()` - path params from `{id}` placeholders
- [ ] Implement `validate()` - validate against OpenAPI 3.0 schema
- [ ] Add request headers inference
- [ ] Add query parameters inference

**OpenAPI Structure**:
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Perplexity API",
    "version": "1.0.0",
    "description": "Auto-generated from dump analysis"
  },
  "servers": [
    {"url": "https://www.perplexity.ai"}
  ],
  "paths": {
    "/api/threads": {
      "get": {
        "summary": "List threads",
        "operationId": "listThreads",
        "parameters": [
          {"name": "limit", "in": "query", "schema": {"type": "integer"}}
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {"$ref": "#/components/schemas/Thread"}
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Thread": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "title": {"type": "string"}
        }
      }
    }
  }
}
```

#### Task 3.3: Unit Tests (50 min)
**File**: `tools/analyzers/test_openapi_generator.py`

**Test Cases**:
- [ ] Test OpenAPI spec generation
- [ ] Test path item generation
- [ ] Test operation generation (GET, POST, PUT, DELETE)
- [ ] Test request body inference
- [ ] Test response inference (multiple status codes)
- [ ] Test path parameter extraction
- [ ] Test query parameter extraction
- [ ] Test spec validation

**Coverage Target**: 85%+

---

### Phase 4: Component-to-API Mapping (2 hours)

#### Task 4.1: Create Component-API Mapper (1.5 hours)
**File**: `tools/analyzers/component_api_mapper.py`

**Class Structure**:
```python
from collections import defaultdict
from typing import Dict, List, Set
import re

class ComponentAPIMapper:
    def __init__(self, components: Dict, network_data: Dict):
        self.components = components
        self.network_data = network_data
        self.mapping = defaultdict(set)
    
    def map(self) -> Dict[str, List[str]]:
        """Map components to APIs they call."""
        pass
    
    def _extract_api_calls(self, code: str) -> List[str]:
        """Extract API calls from component code."""
        pass
    
    def _match_endpoint(self, url: str, endpoints: Dict) -> str:
        """Match API call to normalized endpoint."""
        pass
    
    def _find_fetch_calls(self, code: str) -> List[str]:
        """Find fetch() calls in code."""
        pass
    
    def _find_axios_calls(self, code: str) -> List[str]:
        """Find axios.get/post/etc calls in code."""
        pass
    
    def _normalize_url(self, url: str) -> str:
        """Normalize URL for matching."""
        pass
```

**API Call Patterns to Detect**:
```javascript
// fetch
fetch('/api/threads')
fetch(`/api/threads/${id}`)
await fetch(url, { method: 'POST' })

// axios
axios.get('/api/threads')
axios.post('/api/threads', data)
axios({url: '/api/threads', method: 'GET'})

// Custom clients
api.threads.list()
client.get('/threads')
```

**Subtasks**:
- [ ] Implement `map()` - main entry point
- [ ] Implement `_extract_api_calls()` - combine all extraction methods
- [ ] Implement `_match_endpoint()` - fuzzy matching with normalized endpoints
- [ ] Implement `_find_fetch_calls()` - regex for fetch patterns
- [ ] Implement `_find_axios_calls()` - regex for axios patterns
- [ ] Implement `_normalize_url()` - remove base URL, normalize
- [ ] Handle template literals and string concatenation
- [ ] Handle dynamic URLs

#### Task 4.2: Unit Tests (30 min)
**File**: `tools/analyzers/test_component_api_mapper.py`

**Test Cases**:
- [ ] Test fetch call extraction
- [ ] Test axios call extraction
- [ ] Test URL normalization
- [ ] Test endpoint matching
- [ ] Test component mapping
- [ ] Test template literals
- [ ] Test dynamic URLs

**Coverage Target**: 85%+

---

### Integration Tasks

#### Task 5.1: Create Unified API Analyzer (30 min)
**File**: `tools/analyzers/api_analyzer.py`

```python
class APIAnalyzer:
    """Unified API analysis combining network, schema, and mapping."""
    
    def __init__(self, dump_data: Dict):
        self.dump_data = dump_data
        self.network_analyzer = NetworkAnalyzer(dump_data)
        self.openapi_generator = OpenAPIGenerator()
        self.component_api_mapper = None  # Set after code analysis
    
    def analyze(self, components: Dict = None) -> Dict:
        """Perform full API analysis."""
        # Network analysis
        network_data = self.network_analyzer.analyze()
        
        # OpenAPI generation
        openapi_spec = self.openapi_generator.generate(network_data)
        
        # Component mapping (if components provided)
        component_map = {}
        if components:
            mapper = ComponentAPIMapper(components, network_data)
            component_map = mapper.map()
        
        return {
            'network': network_data,
            'openapi': openapi_spec,
            'component_map': component_map,
        }
```

#### Task 5.2: CLI Integration (30 min)
**File**: `tools/analyze-dump.py` (modify existing)

**Changes**:
```python
@click.option('--extract-api-schema', is_flag=True, help='Extract API schemas from network requests')
@click.option('--generate-openapi', is_flag=True, help='Generate OpenAPI 3.0 specification')
@click.option('--map-components-to-apis', is_flag=True, help='Map components to APIs')
def main(dump_file, extract_api_schema, generate_openapi, map_components_to_apis, ...):
    if extract_api_schema or generate_openapi or map_components_to_apis:
        # Run code analysis first if mapping needed
        components = None
        if map_components_to_apis:
            code_analyzer = CodeGraphAnalyzer(dump_data)
            code_graph = code_analyzer.analyze()
            components = code_graph['components']
        
        # Run API analysis
        api_analyzer = APIAnalyzer(dump_data)
        api_data = api_analyzer.analyze(components)
        
        # Export results
        if generate_openapi:
            output_path = Path(output) / 'openapi-spec.json'
            with open(output_path, 'w') as f:
                json.dump(api_data['openapi'], f, indent=2)
            console.print(f'[green]✅ OpenAPI spec: {output_path}[/green]')
        
        if map_components_to_apis:
            output_path = Path(output) / 'component-api-map.json'
            with open(output_path, 'w') as f:
                json.dump(api_data['component_map'], f, indent=2)
            console.print(f'[green]✅ Component-API map: {output_path}[/green]')
```

#### Task 5.3: Documentation (30 min)
**Files to update**:
- `tools/README.md` - Add API analysis section
- `tools/EXAMPLES.md` - Add usage examples
- `CHANGELOG.md` - Document changes

**Documentation sections**:
- [ ] Feature overview
- [ ] CLI usage examples
- [ ] OpenAPI spec output format
- [ ] Component-API mapping format
- [ ] Limitations and known issues
- [ ] Troubleshooting

---

## 🎯 Acceptance Criteria

### Functional
- [x] Network request parsing with 95%+ success rate
- [x] Schema inference from JSON payloads
- [x] Valid OpenAPI 3.0 specification
- [x] Component-to-API mapping working
- [x] Endpoint normalization (UUIDs, IDs)
- [x] Multi-status code response handling

### Quality
- [x] Test coverage: 85%+ overall
- [x] Network analyzer: 90%+ coverage
- [x] Schema inferencer: 85%+ coverage
- [x] OpenAPI generator: 85%+ coverage
- [x] Component mapper: 85%+ coverage

### Output Quality
- [x] OpenAPI spec validates against OpenAPI 3.0 schema
- [x] Schemas are accurate for 90%+ of endpoints
- [x] Component mapping accuracy: 80%+

### Documentation
- [x] README updated with API analysis features
- [x] Examples for each use case
- [x] OpenAPI spec documentation

---

## 📊 Effort Summary

| Task | Hours |
|------|-------|
| Phase 1: Network Analyzer | 2.0 |
| Phase 2: Schema Inference | 3.0 |
| Phase 3: OpenAPI Generator | 3.0 |
| Phase 4: Component Mapping | 2.0 |
| Integration & CLI | 1.0 |
| Testing & Documentation | 1.0 |
| **Total** | **10.0** |

---

## 🔗 Dependencies

**Required**:
- Python 3.10+
- furl>=2.1
- jsonschema>=4.0
- genson>=1.2
- openapi-schema-validator>=3.0

**Optional**:
- Feature 1 (Code Analysis) - for component-to-API mapping

---

## 🚀 Next Steps

After completing this feature:
1. Test with real Perplexity dumps
2. Validate OpenAPI specs with Swagger Editor
3. Collect user feedback on API mapping accuracy
4. Move to Feature 4 (StackBlitz Integration)
5. Consider enhancements (GraphQL support, WebSocket tracking)

---

**Status**: Ready for Implementation  
**Priority**: High  
**Complexity**: Medium-High
