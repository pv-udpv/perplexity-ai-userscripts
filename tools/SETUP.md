# ⚡ Setup & Installation Guide

## Quick Start (5 minutes)

### Option 1: Using npm (Recommended)

```bash
# From project root
pnpm dump:install

# Then use
pnpm dump:analyze perplexity-dump_*.json --analyze
```

### Option 2: Direct Python

```bash
# Install dependencies
cd tools
pip install -r requirements.txt
cd ..

# Run analyzer
python tools/analyze-dump.py dump.json --analyze
```

### Option 3: Shell Wrapper

```bash
# Make executable
chmod +x scripts/perplexity-analyze

# Use from anywhere in project
./scripts/perplexity-analyze dump.json --analyze
```

---

## Full Installation

### Prerequisites

- **Python**: 3.10+ ([install](https://python.org))
- **Node.js**: 18+ (optional, for npm integration)
- **pip**: Usually comes with Python

### Step-by-Step

#### 1. Clone Repository

```bash
git clone https://github.com/pv-udpv/perplexity-ai-plug.git
cd perplexity-ai-plug
```

#### 2. Choose Installation Method

**A) Using npm (recommended)**:
```bash
pnpm install                # Install Node deps
pnpm dump:install          # Install Python deps
```

**B) Using pip directly**:
```bash
cd tools
python -m venv venv        # Create virtual environment
source venv/bin/activate   # Activate (macOS/Linux)
# or: venv\Scripts\activate (Windows)
pip install -r requirements.txt
```

#### 3. Verify Installation

```bash
# Using npm
pnpm dump:help

# Or directly
python tools/analyze-dump.py --help

# Or via shell wrapper
./scripts/perplexity-analyze --help
```

You should see the CLI help output.

---

## Platform-Specific Instructions

### macOS

```bash
# Install Python (if needed)
brew install python@3.12

# Setup
pnpm dump:install

# Run
pnpm dump:analyze dump.json --analyze
```

### Ubuntu / Debian

```bash
# Install Python
sudo apt update
sudo apt install python3.12 python3.12-venv python3-pip

# Setup
pnpm dump:install

# Run
pnpm dump:analyze dump.json --analyze
```

### Windows

```powershell
# Install Python from https://python.org
# (Check "Add Python to PATH" during installation)

# Then:
pnpm dump:install

# Run
pnpm dump:analyze dump.json --analyze
```

---

## Using Dump Analyzer After Userscript

### Workflow

1. **Run Userscript** in Perplexity (Tampermonkey)
   ```
   Click: 🐍 Dump Storage → Download dump.json
   ```

2. **Move Dump File**
   ```bash
   mv ~/Downloads/perplexity-dump_*.json ./dumps/
   ```

3. **Analyze**
   ```bash
   pnpm dump:analyze ./dumps/perplexity-dump_*.json --analyze --analyze-deps
   ```

4. **View Results**
   ```bash
   # Markdown report
   cat ./dumps/analysis-report.md
   
   # Code graph
   cat ./dumps/code-graph.json
   
   # Schema
   cat ./dumps/schema.json
   ```

---

## Troubleshooting

### "Python not found"

```bash
# Check if Python is installed
python3 --version

# If not, install it:
# macOS: brew install python@3.12
# Ubuntu: sudo apt install python3.12
# Windows: Download from python.org
```

### "Permission denied" on shell script

```bash
chmod +x scripts/perplexity-analyze
```

### "ModuleNotFoundError: click"

```bash
# Install dependencies
pnpm dump:install
# or
pip install -r tools/requirements.txt
```

### "No such file or directory"

```bash
# Make sure you're in project root
cd perplexity-ai-plug

# And dump file exists
ls -la dumps/perplexity-dump_*.json
```

### "Invalid JSON"

Dump file might be corrupted:
```bash
# Check file size (should be > 100KB)
ls -lh dumps/perplexity-dump_*.json

# Validate JSON
python3 -m json.tool dumps/perplexity-dump_*.json > /dev/null
```

---

## Virtual Environment (Advanced)

For isolated Python environment:

```bash
# Create
python3 -m venv tools/venv

# Activate
source tools/venv/bin/activate    # macOS/Linux
# or
tools\venv\Scripts\activate       # Windows

# Install
pip install -r tools/requirements.txt

# Run
python tools/analyze-dump.py dump.json --analyze

# Deactivate
deactivate
```

---

## Performance Tips

### Large Dumps (>50MB)

1. **Use gzip format** (saves 80-90% space):
   ```bash
   pnpm dump:analyze dump.json --export indexeddb --format gz
   ```

2. **Stream large datasets**:
   ```bash
   pnpm dump:analyze dump.json --export indexeddb --format jsonl
   ```

3. **Export only needed sections**:
   ```bash
   # Instead of: --export storage,indexeddb,caches
   # Use: --export indexeddb
   ```

### Memory Issues

If you get "MemoryError":

1. Close other applications
2. Use JSONL format for streaming
3. Split analysis:
   ```bash
   # Analyze one section at a time
   pnpm dump:analyze dump.json --export storage
   pnpm dump:analyze dump.json --export indexeddb
   ```

---

## Advanced Usage

### Custom Analysis Script

```python
# my_analysis.py
from pathlib import Path
import sys
sys.path.insert(0, 'tools')

from analyzers import StorageAnalyzer, IndexedDBAnalyzer
import json

# Load dump
dump = json.load(Path('dump.json').open())

# Analyze
storage = StorageAnalyzer(dump).analyze()
idb = IndexedDBAnalyzer(dump).analyze()

# Custom processing
for db_name, db_info in idb.items():
    print(f"Database: {db_name}")
    for store_name, store_info in db_info['stores'].items():
        print(f"  Store: {store_name} ({store_info['record_count']} records)")
```

Run it:
```bash
python my_analysis.py
```

### Integration with dbt / Data Pipeline

```bash
# Export as JSONL for dbt
pnpm dump:analyze dump.json --export indexeddb --format jsonl --output ./dbt_data

# Then load in dbt:
# dbt/models/raw_indexeddb.sql
# select * from {{ source('perplexity', 'dump_indexeddb_2025-12-25.jsonl') }}
```

---

## FAQ

**Q: Is it safe to analyze dumps?**
A: Yes, analyzer only reads data. No modifications or network calls.

**Q: Can I analyze dumps from different Perplexity accounts?**
A: Yes, each dump is independent.

**Q: How long does analysis take?**
A: ~5-10 seconds for typical 10MB dumps.

**Q: Can I share analysis reports?**
A: Yes, but sanitize sensitive data first (auth tokens, messages).

**Q: Can I schedule automated analysis?**
A: Yes, via cron:
  ```bash
  0 2 * * * cd /path/to/project && pnpm dump:analyze ~/dumps/dump_*.json --analyze
  ```

---

## Getting Help

- **Documentation**: See [tools/README.md](README.md)
- **Issues**: [GitHub Issues](https://github.com/pv-udpv/perplexity-ai-plug/issues)
- **Examples**: See [tools/README.md](README.md#examples)

---

**Last Updated**: 2025-12-25
