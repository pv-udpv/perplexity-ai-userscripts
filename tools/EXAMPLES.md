# 📝 Usage Examples

## Basic Workflow

### 1. Run Userscript & Get Dump

```
1. Open Perplexity.ai
2. Click 🐍 menu (Tampermonkey script)
3. Click "Dump Storage"
4. File downloads to ~/Downloads/perplexity-dump_*.json
```

### 2. Move to Project

```bash
mv ~/Downloads/perplexity-dump_*.json ./
```

### 3. Analyze

```bash
pnpm dump:analyze perplexity-dump_*.json --analyze --analyze-deps
```

### 4. View Reports

```bash
cat dumps/analysis-report.md
jq . dumps/code-graph.json
jq . dumps/schema.json
```

---

## Common Tasks

### Find Authentication Data

```bash
# List all localStorage keys
python -c "
import json
from pathlib import Path

dump = json.load(Path('perplexity-dump_*.json').open())
for key in dump['storage']['localStorage'].keys():
    if 'auth' in key.lower() or 'token' in key.lower():
        print(f'🔑 {key}')
"
```

### Count Total Messages

```bash
python -c "
import json
from pathlib import Path

dump = json.load(Path('perplexity-dump_*.json').open())
for db in dump['indexedDB']:
    for store in db['stores']:
        if store['name'] == 'messages':
            print(f'Total messages: {store[\"count\"]}')
            # Calculate total size
            total_size = sum(len(json.dumps(r)) for r in store['records'])
            print(f'Total size: {total_size / 1024 / 1024:.2f} MB')
            print(f'Avg message size: {total_size / store[\"count\"]:.0f} bytes')
"
```

### Extract All React Components

```bash
# Generate code graph
pnpm dump:analyze perplexity-dump_*.json --analyze-deps

# Extract component names
jq '.components | keys' dumps/code-graph.json

# Find largest components
jq '.components | to_entries | sort_by(.value.size) | reverse | .[0:10]' dumps/code-graph.json
```

### Find Unused Components

```bash
python -c "
import json
from pathlib import Path

graph = json.load(Path('dumps/code-graph.json').open())
imports = set()

# Collect all imports
for component, deps in graph['graph'].items():
    imports.update(deps)

# Find orphaned components
all_components = set(graph['components'].keys())
orphaned = all_components - imports

print(f'Orphaned components: {len(orphaned)}')
for comp in sorted(orphaned):
    print(f'  - {comp}')
"
```

### Analyze Data Distribution

```bash
python -c "
import json
from pathlib import Path
from collections import Counter

dump = json.load(Path('perplexity-dump_*.json').open())

# Message distribution by role
for db in dump['indexedDB']:
    for store in db['stores']:
        if store['name'] == 'messages':
            roles = Counter(r.get('role', 'unknown') for r in store['records'])
            print('Message distribution:')
            for role, count in roles.most_common():
                pct = count / store['count'] * 100
                print(f'  {role}: {count} ({pct:.1f}%)')
"
```

### Clean Sensitive Data

```python
# clean_dump.py
import json
from pathlib import Path

# Load
dump = json.load(Path('perplexity-dump_*.json').open())

# Remove sensitive keys
sensitive_keys = ['auth_token', 'api_key', 'session_id', 'refresh_token']
for key in sensitive_keys:
    dump['storage']['localStorage'].pop(key, None)
    dump['storage']['sessionStorage'].pop(key, None)

# Save
with open('perplexity-dump_CLEAN.json', 'w') as f:
    json.dump(dump, f, indent=2)

print('✅ Cleaned dump saved to perplexity-dump_CLEAN.json')
print('Safe to share!')
```

Run it:
```bash
python clean_dump.py
```

---

## Export Examples

### Export All as Gzip

```bash
pnpm dump:analyze perplexity-dump_*.json \
  --export storage,indexeddb,caches \
  --format gz \
  --output ./exports

ls -lh exports/
# dump_storage_*.jsonz        234 KB
# dump_indexeddb_*.jsonz      1.2 MB
# dump_caches_*.jsonz         5.6 MB
```

### Export as JSONL for dbt

```bash
pnpm dump:analyze perplexity-dump_*.json \
  --export indexeddb \
  --format jsonl \
  --output ./dbt_sources

head -2 dbt_sources/dump_indexeddb_*.jsonl
# {"name": "...", "stores": [{"name": "threads", ...}
```

### Export Just Storage

```bash
pnpm dump:analyze perplexity-dump_*.json \
  --export storage \
  --format json \
  --output ./storage_exports

jq '.localStorage | keys' storage_exports/dump_storage_*.json
```

---

## Report Generation

### View Markdown Report

```bash
# Generate full analysis
pnpm dump:analyze perplexity-dump_*.json --analyze

# View report
cat dumps/analysis-report.md

# Or with pager
less dumps/analysis-report.md

# Convert to HTML
markdown dumps/analysis-report.md > report.html
```

### Check Schema

```bash
# View schema (pretty printed)
jq . dumps/schema.json | head -50

# Find all field types
jq '.[] | keys' dumps/schema.json

# Check specific store
jq '.db_perplexity_db.threads' dumps/schema.json
```

### Analyze Code Graph

```bash
# Component count
jq '.stats.total_components' dumps/code-graph.json

# Dependency count
jq '.stats.total_dependencies' dumps/code-graph.json

# Find most imported modules
jq '[.graph | to_entries[].value[]] | group_by(.) | sort_by(length) | reverse | .[0:10][]' dumps/code-graph.json
```

---

## Advanced Analysis

### Timeline Analysis

```python
# timeline.py
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

dump = json.load(Path('perplexity-dump_*.json').open())

# Group messages by date
dates = defaultdict(int)
for db in dump['indexedDB']:
    for store in db['stores']:
        if store['name'] == 'messages':
            for msg in store['records']:
                if 'created_at' in msg:
                    ts = msg['created_at'] / 1000  # Convert to seconds
                    date = datetime.fromtimestamp(ts).date()
                    dates[str(date)] += 1

print('Messages by date:')
for date in sorted(dates.keys()):
    print(f'  {date}: {dates[date]} messages')
```

### Tag Analysis

```python
# tags.py
import json
from pathlib import Path
from collections import Counter

dump = json.load(Path('perplexity-dump_*.json').open())

# Count tag usage
tags = Counter()
for db in dump['indexedDB']:
    for store in db['stores']:
        if store['name'] == 'threads':
            for thread in store['records']:
                if 'tags' in thread:
                    tags.update(thread['tags'])

print('Top tags:')
for tag, count in tags.most_common(20):
    print(f'  {tag}: {count}')
```

### Storage Size Analysis

```bash
python -c "
import json
from pathlib import Path

dump = json.load(Path('perplexity-dump_*.json').open())

# Analyze localStorage
ls = dump['storage']['localStorage']
print('localStorage top values:')
for key, val in sorted(ls.items(), key=lambda x: x[1].get('size', 0), reverse=True)[:10]:
    size = val.get('size', 0) / 1024
    print(f'  {key}: {size:.1f} KB')
"
```

---

## Batch Analysis

### Analyze Multiple Dumps

```bash
#!/bin/bash
# analyze_all.sh

for dump in dumps/perplexity-dump_*.json; do
    echo "🐍 Analyzing $dump..."
    pnpm dump:analyze "$dump" --analyze --output "./results/$(basename $dump .json)"
done

echo "✅ Done! Results in ./results/"
```

Run:
```bash
chmod +x analyze_all.sh
./analyze_all.sh
```

### Compare Multiple Dumps

```python
# compare_dumps.py
import json
from pathlib import Path
from datetime import datetime

dumps = sorted(Path('.').glob('perplexity-dump_*.json'))

print(f'📊 Comparing {len(dumps)} dumps\n')

for dump_path in dumps:
    dump = json.load(dump_path.open())
    
    # Count records
    messages = 0
    threads = 0
    for db in dump['indexedDB']:
        for store in db['stores']:
            if store['name'] == 'messages':
                messages = store['count']
            elif store['name'] == 'threads':
                threads = store['count']
    
    timestamp = dump_path.name.split('_')[2][:16]
    print(f'{timestamp}: {threads} threads, {messages} messages')
```

---

## Integration Examples

### Slack Bot

```python
# Send analysis summary to Slack
import json
import subprocess
import requests
from pathlib import Path

# Run analyzer
result = subprocess.run(
    ['pnpm', 'dump:analyze', 'dump.json', '--analyze'],
    capture_output=True,
    text=True
)

# Parse results
report = Path('dumps/analysis-report.md').read_text()

# Send to Slack
response = requests.post(
    'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
    json={
        'text': 'Perplexity Dump Analysis Complete',
        'blocks': [
            {
                'type': 'section',
                'text': {'type': 'mrkdwn', 'text': report[:2000]}
            }
        ]
    }
)
```

### GitHub Action

```yaml
# .github/workflows/analyze-dumps.yml
name: Analyze Storage Dumps

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      
      - name: Install dependencies
        run: pip install -r tools/requirements.txt
      
      - name: Download dump
        run: |
          # Your download logic here
          curl -o dump.json ${{ secrets.DUMP_URL }}
      
      - name: Analyze
        run: |
          python tools/analyze-dump.py dump.json --analyze --analyze-deps
      
      - name: Upload reports
        uses: actions/upload-artifact@v3
        with:
          name: analysis-reports
          path: dumps/
```

---

**More examples coming soon!**

Have a useful workflow? [Submit a PR!](https://github.com/pv-udpv/perplexity-ai-plug/pulls)
