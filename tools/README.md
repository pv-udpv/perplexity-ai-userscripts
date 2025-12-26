# 🔍 Perplexity Storage Dump Analyzer

Comprehensive Python tool for analyzing, filtering, and exporting Perplexity Storage Dumps.

**Features**:
- 📦 Selective export (json, gz, jsonl formats)
- 📊 Cardinality & schema analysis
- 🔗 Code dependency graph extraction
- 📋 Automatic report generation
- 🐍 Full Python 3.10+ support

---

## ⚡ Quick Start

### Installation

```bash
# Option 1: Use npm script (if in project root)
pnpm dump:install

# Option 2: Manual setup
cd tools
pip install -r requirements.txt
```

### Basic Usage

```bash
# Via npm
pnpm dump:analyze perplexity-dump_*.json --analyze

# Or directly
python tools/analyze-dump.py dump.json --analyze

# Or via shell script
./scripts/perplexity-analyze dump.json --analyze
```

---

## 📚 Commands

### Full Analysis

```bash
python tools/analyze-dump.py dump.json --analyze --analyze-deps --output ./results
```

**Output**:
```
📊 Storage Analysis
localStorage: 15 keys, 2.34 MB
sessionStorage: 8 keys, 234 KB

📊 IndexedDB Analysis
Database: perplexity-db
  Store: threads (42 records)
  Store: messages (1,247 records)

📊 Code Analysis
Components: 42
Dependencies: 156

✅ Done!
```

### Export with Compression

```bash
python tools/analyze-dump.py dump.json \
  --export storage,indexeddb,caches \
  --format gz \
  --output ./exports
```

**Output files**:
```
exports/
├── dump_storage_2025-12-25.jsonz (234.5 KB)
├── dump_indexeddb_2025-12-25.jsonz (1.2 MB)
└── dump_caches_2025-12-25.jsonz (5.6 MB)
```

### Code Dependencies Only

```bash
python tools/analyze-dump.py dump.json --analyze-deps --output ./code-analysis
```

**Output**:
```json
{
  "components": {
    "_app": {
      "url": "https://.../app-abc123.js",
      "size": 12345,
      "imports": ["react", "zustand", "./Layout"]
    }
  },
  "stats": {
    "total_components": 42,
    "total_dependencies": 156
  }
}
```

---

## 🎯 CLI Options

```bash
usage: analyze-dump.py [-h] [--analyze] [--export EXPORT] [--format {json,gz,jsonl}]
                       [--extract-code EXTRACT_CODE] [--analyze-deps]
                       [--output OUTPUT]
                       dump_file

Analyze and export Perplexity Storage Dumps.

positional arguments:
  dump_file                      Path to dump JSON file

options:
  --analyze                      Perform full analysis
  --export EXPORT                Export sections (comma-separated:
                                 storage,indexeddb,caches)
  --format {json,gz,jsonl}      Export format (default: gz)
  --extract-code EXTRACT_CODE    Extract JS/CSS code to directory
  --analyze-deps                 Analyze code dependencies
  --output OUTPUT               Output directory (default: ./dumps)
  -h, --help                    show this help message and exit
```

---

## 📊 Analysis Output

### Storage Analysis

Detects:
- **Key patterns**: `auth_*`, `cache_*`, `config_*`
- **Value distribution**: min, max, median, average sizes
- **Data types**: JSON objects/arrays, strings, numbers
- **Cardinality**: unique values per key

### IndexedDB Analysis

Infers:
- **Schema**: field types, nullability, presence %
- **Cardinality**: unique values, distribution ratios
- **Indexes**: extracted index definitions (not analyzed yet)

### Code Graph

Extracts:
- **Imports**: from all cached JavaScript files
- **Dependencies**: module relationships
- **Components**: function/class definitions
- **Statistics**: total components, dependency count

---

## 🔒 Security Notes

⚠️ **Dumps contain sensitive data**:
- Authentication tokens
- User messages
- Personal settings
- API keys

✅ **Best Practices**:
- Never share dumps publicly
- Use `--export` to extract only needed sections
- Sanitize before sharing:
  ```python
  import json
  dump = json.load(open('dump.json'))
  dump['storage']['localStorage'].pop('auth_token', None)
  json.dump(dump, open('dump-clean.json', 'w'))
  ```
- Store exports with restricted file permissions

---

## 📈 Performance

- **Typical 10MB dump**: 5-10 seconds
- **Streaming export (JSONL)**: 30 seconds for 100k records
- **Code graph generation**: 2-3 seconds
- **Report generation**: <1 second

---

## 📁 Output Files

When using `--analyze` or `--analyze-deps` with `--output ./analysis`:

```
analysis/
├── code-graph.json              # Dependency graph (with --analyze-deps)
├── schema.json                  # Inferred JSON Schema (with --analyze)
└── analysis-report.md           # Markdown report (with --analyze)
```

When using `--export` with `--output ./exports`:

```
exports/
├── dump_storage_*.jsonz         # Compressed storage data
├── dump_indexeddb_*.jsonz       # Compressed IndexedDB data
└── dump_caches_*.jsonz          # Compressed cache data
```

---

## 🛠️ Development

### Project Structure

```
tools/
├── analyze-dump.py              # Main CLI entry point
├── analyzers/
│   ├── __init__.py
│   ├── storage.py               # localStorage/sessionStorage
│   ├── indexeddb.py             # IndexedDB analysis
│   ├── caches.py                # Cache API analysis
│   ├── code_graph.py            # Code dependency extraction
│   └── reporter.py              # Report & schema export
├── requirements.txt
└── README.md

scripts/
├── perplexity-analyze           # Shell wrapper
└── install-analyzer.sh          # Setup script
```

### Adding Custom Analyzers

```python
from analyzers.storage import StorageAnalyzer
from typing import Dict, Any

class CustomAnalyzer:
    def __init__(self, data: Dict[str, Any]):
        self.data = data
    
    def analyze(self) -> Dict[str, Any]:
        # Your analysis logic
        return {}
```

---

## 📝 Examples

### Find Authentication Data

```python
import json
from pathlib import Path

dump = json.load(Path('dump.json').open())

for key, value in dump['storage']['localStorage'].items():
    if 'auth' in key.lower():
        print(f"🔑 {key}")
        if 'parsed' in value:
            print(json.dumps(value['parsed'], indent=2))
```

### Analyze Message Volume

```bash
python -c "
import json
from pathlib import Path

dump = json.load(Path('dump.json').open())
for db in dump['indexedDB']:
    for store in db['stores']:
        if store['name'] == 'messages':
            print(f'Total messages: {store[\"count\"]}')
            sizes = [len(json.dumps(r)) for r in store['records'][:100]]
            print(f'Avg size: {sum(sizes)/len(sizes):.0f} bytes')
"
```

### Extract React Components

```bash
python tools/analyze-dump.py dump.json --analyze-deps
jq '.components | keys' code-graph.json | head -20
```

---

## 🐛 Troubleshooting

### Python not found

```bash
# Install Python 3.10+
# macOS
brew install python@3.12

# Ubuntu
sudo apt install python3.12 python3.12-venv

# Windows
# Download from python.org
```

### Missing dependencies

```bash
pnpm dump:install
# or
pip install -r tools/requirements.txt
```

### Permission denied on shell script

```bash
chmod +x scripts/perplexity-analyze
```

---

## 📄 License

MIT - see [LICENSE](../LICENSE)

---

## 🙋 Support

For issues and feature requests, see [GitHub Issues](https://github.com/pv-udpv/perplexity-ai-plug/issues)
