#!/usr/bin/env python3
"""
Perplexity Storage Dumper - Analyzer

Comprehensive tool for analyzing, filtering, and exporting storage dumps.

Usage:
    python analyze-dump.py dump.json --analyze
    python analyze-dump.py dump.json --export storage,indexeddb --format gz
    python analyze-dump.py dump.json --extract-code --analyze-deps
"""

import json
import gzip
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional, Set
from collections import defaultdict, Counter
import re
from datetime import datetime

try:
    import click
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
except ImportError:
    print("❌ Missing dependencies. Install with: pip install -r tools/requirements.txt")
    sys.exit(1)

console = Console()

# ========================================
# Core Classes
# ========================================

class DumpLoader:
    """Load and parse storage dumps."""
    
    @staticmethod
    def load(path: Path) -> Dict[str, Any]:
        """Load JSON dump."""
        with open(path, 'r') as f:
            return json.load(f)
    
    @staticmethod
    def validate(data: Dict) -> bool:
        """Validate dump structure."""
        required_keys = {'metadata', 'storage'}
        return all(key in data for key in required_keys)


class StorageAnalyzer:
    """Analyze localStorage/sessionStorage."""
    
    def __init__(self, data: Dict[str, Any]):
        self.data = data.get('storage', {})
    
    def analyze(self) -> Dict[str, Any]:
        """Perform full analysis."""
        return {
            'localStorage': self._analyze_storage(self.data.get('localStorage', {})),
            'sessionStorage': self._analyze_storage(self.data.get('sessionStorage', {})),
        }
    
    def _analyze_storage(self, storage: Dict) -> Dict[str, Any]:
        """Analyze single storage (localStorage or sessionStorage)."""
        keys = list(storage.keys())
        
        # Key patterns
        key_patterns = self._extract_patterns(keys)
        
        # Value sizes
        sizes = [v.get('size', 0) for v in storage.values() if isinstance(v, dict)]
        
        # Data types
        types = self._infer_types(storage)
        
        # Cardinality
        cardinality = self._analyze_cardinality(storage)
        
        return {
            'total_keys': len(keys),
            'total_size_bytes': sum(sizes),
            'avg_value_size': sum(sizes) / len(sizes) if sizes else 0,
            'key_patterns': key_patterns,
            'value_sizes_bytes': {
                'min': min(sizes) if sizes else 0,
                'max': max(sizes) if sizes else 0,
                'median': sorted(sizes)[len(sizes)//2] if sizes else 0,
            },
            'data_types': types,
            'cardinality': cardinality,
        }
    
    def _extract_patterns(self, keys: List[str]) -> Dict[str, int]:
        """Extract common key patterns."""
        patterns = defaultdict(int)
        
        for key in keys:
            # Detect prefix pattern (word_*)
            match = re.match(r'^([a-z_]+?)_', key)
            if match:
                prefix = match.group(1)
                patterns[f'{prefix}_*'] += 1
            else:
                patterns[key] += 1
        
        return dict(patterns)
    
    def _infer_types(self, storage: Dict) -> Dict[str, int]:
        """Infer data types in storage."""
        types = Counter()
        
        for value in storage.values():
            if not isinstance(value, dict):
                continue
            
            raw_value = value.get('value', '')
            if value.get('parsed') is not None:
                parsed = value.get('parsed')
                if isinstance(parsed, list):
                    types['JSON_array'] += 1
                elif isinstance(parsed, dict):
                    types['JSON_object'] += 1
                else:
                    types[type(parsed).__name__] += 1
            else:
                types['string'] += 1
        
        return dict(types)
    
    def _analyze_cardinality(self, storage: Dict) -> Dict[str, Any]:
        """Analyze cardinality for each key."""
        result = {}
        
        for key, value in storage.items():
            if isinstance(value, dict) and 'parsed' in value:
                parsed = value.get('parsed')
                if isinstance(parsed, list):
                    result[key] = {'type': 'array', 'cardinality': len(parsed)}
                elif isinstance(parsed, dict):
                    result[key] = {'type': 'object', 'cardinality': len(parsed.keys())}
                else:
                    result[key] = {'type': type(parsed).__name__, 'unique_values': 1}
        
        return result


class IndexedDBAnalyzer:
    """Analyze IndexedDB stores."""
    
    def __init__(self, data: Dict[str, Any]):
        self.data = data.get('indexedDB', [])
    
    def analyze(self) -> Dict[str, Any]:
        """Full IndexedDB analysis."""
        result = {}
        
        for db in self.data:
            db_name = db.get('name', 'unknown')
            result[db_name] = {
                'version': db.get('version'),
                'stores': {}
            }
            
            for store in db.get('stores', []):
                store_name = store.get('name')
                records = store.get('records', [])
                
                result[db_name]['stores'][store_name] = {
                    'record_count': store.get('count', len(records)),
                    'key_path': store.get('keyPath'),
                    'indexes': store.get('indexes', []),
                    'schema': self._infer_schema(records),
                    'cardinality': self._analyze_cardinality(records),
                }
        
        return result
    
    def _infer_schema(self, records: List[Dict]) -> Dict[str, Any]:
        """Infer schema from records."""
        if not records:
            return {}
        
        # Analyze first record and sample
        schema = {}
        first = records[0]
        
        for key, value in first.items():
            if value is None:
                field_type = 'null'
            elif isinstance(value, bool):
                field_type = 'boolean'
            elif isinstance(value, int):
                field_type = 'number'
            elif isinstance(value, str):
                field_type = 'string'
            elif isinstance(value, list):
                field_type = 'array'
            elif isinstance(value, dict):
                field_type = 'object'
            else:
                field_type = type(value).__name__
            
            schema[key] = {
                'type': field_type,
                'presence': f"{sum(1 for r in records if key in r)/len(records)*100:.0f}%",
            }
            
            # For strings, track max length
            if field_type == 'string':
                lengths = [len(str(r.get(key, ''))) for r in records if key in r]
                if lengths:
                    schema[key]['max_length'] = max(lengths)
                    schema[key]['avg_length'] = sum(lengths) / len(lengths)
        
        return schema
    
    def _analyze_cardinality(self, records: List[Dict]) -> Dict[str, Any]:
        """Analyze field cardinality."""
        result = {}
        
        if not records:
            return result
        
        first = records[0]
        for key in first.keys():
            values = [r.get(key) for r in records if key in r]
            unique = len(set(str(v) for v in values))
            result[key] = {
                'unique_values': unique,
                'cardinality_ratio': unique / len(records),
            }
        
        return result


class CacheAnalyzer:
    """Analyze Cache API data."""
    
    def __init__(self, data: Dict[str, Any]):
        self.data = data.get('caches', {})
    
    def analyze(self) -> Dict[str, Any]:
        """Analyze caches."""
        stats = self.data.get('stats', {})
        
        # Analyze content types
        content_types = defaultdict(int)
        total_size = 0
        
        for cache in self.data.get('caches', []):
            for entry in cache.get('entries', []):
                response = entry.get('response', {})
                content_type = response.get('contentType', 'unknown')
                content_types[content_type] += 1
                total_size += response.get('bodySize', 0)
        
        return {
            'stats': stats,
            'content_types': dict(content_types),
            'total_cached_size': total_size,
        }


class CodeGraphAnalyzer:
    """Extract and analyze code dependencies."""
    
    def __init__(self, data: Dict[str, Any]):
        self.data = data.get('caches', {})
        self.imports = defaultdict(set)
        self.files = {}
    
    def analyze(self) -> Dict[str, Any]:
        """Extract code graph from cached JS."""
        for cache in self.data.get('caches', []):
            for entry in cache.get('entries', []):
                if not self._is_javascript(entry):
                    continue
                
                url = entry.get('url', '')
                response = entry.get('response', {})
                body = response.get('body', '')
                
                if not body:
                    continue
                
                # Extract imports
                imports = self._extract_imports(body)
                file_key = self._get_component_name(url)
                
                self.files[file_key] = {
                    'url': url,
                    'size': response.get('bodySize', 0),
                    'imports': list(imports),
                }
                self.imports[file_key] = imports
        
        return {
            'components': self.files,
            'graph': dict(self.imports),
            'stats': {
                'total_components': len(self.files),
                'total_dependencies': sum(len(deps) for deps in self.imports.values()),
            }
        }
    
    def _is_javascript(self, entry: Dict) -> bool:
        """Check if entry is JavaScript."""
        response = entry.get('response', {})
        content_type = response.get('contentType', '').lower()
        return 'javascript' in content_type
    
    def _extract_imports(self, code: str) -> Set[str]:
        """Extract import statements from JS."""
        imports = set()
        
        # Match: import ... from 'module'
        for match in re.finditer(r"(?:import|require)\(['\"]([^'\"]+)['\"]\)", code):
            imports.add(match.group(1))
        
        for match in re.finditer(r"from\s+['\"]([^'\"]+)['\"]", code):
            imports.add(match.group(1))
        
        return imports
    
    def _get_component_name(self, url: str) -> str:
        """Extract component name from URL."""
        # Extract filename
        parts = url.split('/')
        filename = parts[-1].split('?')[0]
        # Remove hash
        return filename.split('-')[0] if '-' in filename else filename


class DumpExporter:
    """Export dumps in various formats."""
    
    @staticmethod
    def export_json(data: Dict, path: Path) -> None:
        """Export as JSON."""
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
    
    @staticmethod
    def export_gz(data: Dict, path: Path) -> None:
        """Export as gzipped JSON."""
        json_data = json.dumps(data, indent=2).encode('utf-8')
        with gzip.open(path, 'wb') as f:
            f.write(json_data)
    
    @staticmethod
    def export_jsonl(data: List[Dict], path: Path) -> None:
        """Export as JSONL (line-delimited JSON)."""
        with open(path, 'w') as f:
            for item in data:
                f.write(json.dumps(item) + '\n')


class ReportGenerator:
    """Generate markdown reports."""
    
    @staticmethod
    def generate(analysis: Dict[str, Any], output: Path) -> None:
        """Generate markdown report."""
        report = f"""# Perplexity Storage Dump Analysis

Generated: {datetime.now().isoformat()}

## Storage Analysis

### localStorage
"""
        
        storage_analysis = analysis.get('storage', {}).get('localStorage', {})
        report += f"""
**Total Keys**: {storage_analysis.get('total_keys', 0)}
**Total Size**: {storage_analysis.get('total_size_bytes', 0) / 1024:.2f} KB
**Avg Value Size**: {storage_analysis.get('avg_value_size', 0):.0f} bytes

#### Key Patterns
"""
        
        for pattern, count in storage_analysis.get('key_patterns', {}).items():
            report += f"- `{pattern}`: {count} keys\n"
        
        with open(output, 'w') as f:
            f.write(report)


# ========================================
# CLI
# ========================================

@click.command()
@click.argument('dump_file', type=click.Path(exists=True))
@click.option('--analyze', is_flag=True, help='Perform full analysis')
@click.option('--export', type=str, default=None, help='Export sections (comma-separated: storage,indexeddb,caches)')
@click.option('--format', type=click.Choice(['json', 'gz', 'jsonl']), default='gz', help='Export format')
@click.option('--extract-code', type=click.Path(), default=None, help='Extract JS/CSS code')
@click.option('--analyze-deps', is_flag=True, help='Analyze code dependencies')
@click.option('--output', type=click.Path(), default='./dumps', help='Output directory')
def main(dump_file, analyze, export, format, extract_code, analyze_deps, output):
    """
    Analyze and export Perplexity Storage Dumps.
    
    Example:
        python analyze-dump.py dump.json --analyze
        python analyze-dump.py dump.json --export storage,indexeddb --format gz
    """
    
    console.print("[bold blue]📦 Perplexity Storage Dump Analyzer[/bold blue]")
    console.print(f"File: {dump_file}\n")
    
    # Load dump
    try:
        dump_path = Path(dump_file)
        data = DumpLoader.load(dump_path)
        
        if not DumpLoader.validate(data):
            console.print("[red]❌ Invalid dump structure[/red]")
            sys.exit(1)
    except Exception as e:
        console.print(f"[red]❌ Failed to load dump: {e}[/red]")
        sys.exit(1)
    
    # Analyze
    if analyze:
        console.print("[yellow]Analyzing storage...[/yellow]")
        storage_analysis = StorageAnalyzer(data).analyze()
        console.print("[green]✅ Storage analysis complete[/green]\n")
        
        # Display results
        table = Table(title="localStorage Analysis")
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="magenta")
        
        ls = storage_analysis['localStorage']
        table.add_row("Total Keys", str(ls['total_keys']))
        table.add_row("Total Size", f"{ls['total_size_bytes'] / 1024:.2f} KB")
        table.add_row("Avg Value Size", f"{ls['avg_value_size']:.0f} bytes")
        
        console.print(table)
        console.print()
        
        console.print("[yellow]Analyzing IndexedDB...[/yellow]")
        idb_analysis = IndexedDBAnalyzer(data).analyze()
        console.print("[green]✅ IndexedDB analysis complete[/green]\n")
        
        for db_name, db_info in idb_analysis.items():
            console.print(f"[bold]Database: {db_name}[/bold]")
            for store_name, store_info in db_info.get('stores', {}).items():
                console.print(f"  Store: {store_name}")
                console.print(f"    Records: {store_info['record_count']}")
    
    # Export
    if export:
        console.print("[yellow]Exporting sections...[/yellow]")
        output_dir = Path(output)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        sections = [s.strip() for s in export.split(',')]
        
        for section in sections:
            if section not in data:
                console.print(f"[yellow]⚠️  Section '{section}' not found[/yellow]")
                continue
            
            export_data = data[section]
            timestamp = data.get('metadata', {}).get('timestamp', '').replace(':', '-')[:16]
            filename = f"dump_{section}_{timestamp}.json{'z' if format == 'gz' else ''}"
            filepath = output_dir / filename
            
            if format == 'json':
                DumpExporter.export_json(export_data, filepath)
            elif format == 'gz':
                DumpExporter.export_gz(export_data, filepath)
            
            size = filepath.stat().st_size / 1024
            console.print(f"[green]✅[/green] {filename} ({size:.1f} KB)")
    
    # Code analysis
    if analyze_deps:
        console.print("[yellow]Analyzing code dependencies...[/yellow]")
        code_analyzer = CodeGraphAnalyzer(data)
        graph = code_analyzer.analyze()
        console.print("[green]✅ Code graph complete[/green]\n")
        
        stats = graph.get('stats', {})
        console.print(f"Components: {stats.get('total_components', 0)}")
        console.print(f"Dependencies: {stats.get('total_dependencies', 0)}")
        
        # Export graph
        output_dir = Path(output)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        graph_file = output_dir / 'code-graph.json'
        DumpExporter.export_json(graph, graph_file)
        console.print(f"[green]✅[/green] Graph exported to {graph_file}")
    
    console.print("\n[green][bold]✅ Done![/bold][/green]")


if __name__ == '__main__':
    main()
