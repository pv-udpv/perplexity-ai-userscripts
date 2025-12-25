# Perplexity Dump Analyzer

🔍 **Comprehensive analysis and export tool for Perplexity Storage Dumps**

## Installation

```bash
cd tools
pip install -r requirements.txt
```

## Usage

### Basic Analysis

```bash
python analyze-dump.py perplexity-dump_2025-12-25T20-38-00.json --analyze
```

Output:
```
📊 Storage Analysis
localStorage:
  Total Keys: 15
  Total Size: 2.3 MB
  Avg Value Size: 154 KB

IndexedDB:
  Database: perplexity-db
    Store: threads (42 records)
    Store: messages (1,247 records)
```

### Export Specific Sections

```bash
# Export as gzipped JSON
python analyze-dump.py dump.json --export storage,indexeddb --format gz --output ./exports

# Output:
# ✅ dump_storage_2025-12-25.jsonz (234.5 KB)
# ✅ dump_indexeddb_2025-12-25.jsonz (1.2 MB)
```

### Extract Code & Dependencies

```bash
python analyze-dump.py dump.json --analyze-deps --output ./analysis

# Output:
# Components: 42
# Dependencies: 156
# ✅ Graph exported to ./analysis/code-graph.json
```

## Features

### 📊 Storage Analysis

- **Cardinality analysis** - unique values per key
- **Key patterns** - detect prefixes (auth_*, cache_*)
- **Data type inference** - JSON, strings, numbers
- **Size distribution** - min, max, median, avg

### 🗄️ IndexedDB Analysis

- **Schema inference** - detect field types
- **Cardinality per field** - uniqueness ratio
- **Foreign key detection** - relationship analysis
- **Index analysis** - performance indicators

### 💾 Export Options

```bash
# Format: json, gz (gzipped), jsonl (line-delimited)
python analyze-dump.py dump.json --export storage --format gz

# Split by store
python analyze-dump.py dump.json --export indexeddb --split-by store
```

### 🔍 Code Graph

```bash
python analyze-dump.py dump.json --analyze-deps
```

Produces `code-graph.json` with:
- Import statements extracted from JS
- Dependency relationships
- Component metadata (size, type)
- Circular dependency detection

## Output Files

When using `--output ./analysis`:

```
analysis/
├── dump_storage_2025-12-25.jsonz      # Compressed storage data
├── dump_indexeddb_2025-12-25.jsonz    # Compressed IndexedDB data
├── code-graph.json                    # Dependency graph
└── analysis-report.md                 # Markdown report
```

## Performance

- Typical 10MB dump: ~5-10 seconds
- Streaming export (JSONL): ~30 seconds for 100k records
- Code graph generation: ~2-3 seconds

## Examples

### Find authentication tokens

```python
import json
from pathlib import Path

dump = json.load(Path('dump.json').open())

for key, value in dump['storage']['localStorage'].items():
    if 'auth' in key.lower():
        print(f"🔑 {key}")
        if 'parsed' in value:
            print(f"   Value: {json.dumps(value['parsed'], indent=2)}")
```

### Analyze message volume

```python
for db in dump['indexedDB']:
    for store in db['stores']:
        if store['name'] == 'messages':
            print(f"Total messages: {store['count']}")
            # Analyze record sizes
            sizes = [len(json.dumps(r)) for r in store['records']]
            print(f"Avg message size: {sum(sizes)/len(sizes):.0f} bytes")
```

### Extract React components

```bash
python analyze-dump.py dump.json --analyze-deps

# Then analyze code-graph.json
jq '.components | keys' code-graph.json
```

## Security Notes

⚠️ **Dumps may contain sensitive data:**
- Authentication tokens
- User messages
- Personal settings
- API keys

**Never share dumps publicly!**

Clean sensitive data:
```python
dump['storage']['localStorage'].pop('auth_token', None)
dump['storage']['localStorage'].pop('api_key', None)
```

## License

MIT - see [LICENSE](../LICENSE)
