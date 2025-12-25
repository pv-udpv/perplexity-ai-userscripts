#!/usr/bin/env python3
"""
Perplexity Storage Dumper - Analyzer

Comprehensive tool for analyzing, filtering, and exporting storage dumps.

Usage:
    python analyze-dump.py dump.json --analyze
    python analyze-dump.py dump.json --export storage,indexeddb --format gz
    python analyze-dump.py dump.json --analyze-deps --output ./results
"""

import json
import gzip
import sys
import csv
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

try:
    import click
    from rich.console import Console
    from rich.table import Table
    from rich.progress import Progress
except ImportError:
    print("📦 Missing dependencies. Install with: pip install -r tools/requirements.txt")
    sys.exit(1)

# Import analyzers
from analyzers import (
    StorageAnalyzer,
    IndexedDBAnalyzer,
    CacheAnalyzer,
    CodeGraphAnalyzer,
    ReportGenerator,
    SchemaExporter,
)

console = Console()

# ========================================
# Core Classes
# ========================================

class DumpLoader:
    """Load and parse storage dumps."""
    
    @staticmethod
    def load(path: Path) -> Dict[str, Any]:
        """Load JSON dump."""
        console.print(f"[yellow]📄 Loading dump: {path.name}[/yellow]")
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            console.print(f"[red]❌ Invalid JSON: {e}[/red]")
            sys.exit(1)
        except FileNotFoundError:
            console.print(f"[red]❌ File not found: {path}[/red]")
            sys.exit(1)
    
    @staticmethod
    def validate(data: Dict) -> bool:
        """Validate dump structure."""
        required_keys = {'metadata', 'storage'}
        return all(key in data for key in required_keys)


class DumpExporter:
    """Export dumps in various formats."""
    
    @staticmethod
    def export_json(data: Dict, path: Path) -> int:
        """Export as JSON. Returns size in bytes."""
        json_data = json.dumps(data, indent=2)
        with open(path, 'w') as f:
            f.write(json_data)
        return len(json_data.encode('utf-8'))
    
    @staticmethod
    def export_gz(data: Dict, path: Path) -> int:
        """Export as gzipped JSON. Returns size in bytes."""
        json_data = json.dumps(data, indent=2).encode('utf-8')
        with gzip.open(path, 'wb') as f:
            f.write(json_data)
        return path.stat().st_size
    
    @staticmethod
    def export_jsonl(items: List[Dict], path: Path) -> int:
        """Export as JSONL. Returns number of items."""
        with open(path, 'w') as f:
            for item in items:
                f.write(json.dumps(item) + '\n')
        return len(items)


class AnalysisPipeline:
    """Orchestrate full analysis."""
    
    def __init__(self, data: Dict[str, Any], output_dir: Path):
        self.data = data
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.analysis = {}
    
    def run_all(self) -> Dict[str, Any]:
        """Run complete analysis."""
        console.print("\n[bold blue]📀 Starting Analysis Pipeline[/bold blue]\n")
        
        # Storage
        console.print("[cyan]■[/cyan] Analyzing storage...", end="")
        self.analysis['storage'] = StorageAnalyzer(self.data).analyze()
        console.print(" [green]✅[/green]")
        
        # IndexedDB
        console.print("[cyan]■[/cyan] Analyzing IndexedDB...", end="")
        self.analysis['indexeddb'] = IndexedDBAnalyzer(self.data).analyze()
        console.print(" [green]✅[/green]")
        
        # Caches
        console.print("[cyan]■[/cyan] Analyzing caches...", end="")
        self.analysis['caches'] = CacheAnalyzer(self.data).analyze()
        console.print(" [green]✅[/green]")
        
        # Code graph
        console.print("[cyan]■[/cyan] Extracting code graph...", end="")
        self.analysis['code_graph'] = CodeGraphAnalyzer(self.data).analyze()
        console.print(" [green]✅[/green]")
        
        return self.analysis
    
    def export_sections(self, sections: List[str], format: str) -> None:
        """Export specific sections."""
        console.print(f"\n[bold blue]💾 Exporting Sections ({format})[/bold blue]\n")
        
        timestamp = self.data.get('metadata', {}).get('timestamp', '')[:16].replace(':', '-')
        
        # Create case-insensitive mapping of section names
        data_keys = {k.lower(): k for k in self.data.keys()}
        
        for section in sections:
            section_lower = section.lower()
            
            # Find the actual key in data (case-insensitive)
            actual_key = data_keys.get(section_lower)
            
            if not actual_key:
                console.print(f"[yellow]⚠️  Section '{section}' not found[/yellow]")
                continue
            
            export_data = self.data[actual_key]
            
            if format == 'json':
                filename = f"dump_{section_lower}_{timestamp}.json"
                filepath = self.output_dir / filename
                size = DumpExporter.export_json(export_data, filepath)
            elif format == 'gz':
                filename = f"dump_{section_lower}_{timestamp}.jsonz"
                filepath = self.output_dir / filename
                size = DumpExporter.export_gz(export_data, filepath)
            else:
                continue
            
            size_mb = size / 1024 / 1024
            console.print(f"[green]✅[/green] {filename} ({size_mb:.2f} MB)")
    
    def generate_reports(self) -> None:
        """Generate all reports and exports."""
        console.print(f"\n[bold blue]📋 Generating Reports[/bold blue]\n")
        
        # Markdown report
        report_path = self.output_dir / 'analysis-report.md'
        ReportGenerator.generate(self.analysis, report_path)
        console.print(f"[green]✅[/green] analysis-report.md")
        
        # JSON Schema
        schema_path = self.output_dir / 'schema.json'
        schema = SchemaExporter.to_json_schema(self.analysis)
        SchemaExporter.export_json(schema, schema_path)
        console.print(f"[green]✅[/green] schema.json")
        
        # Code graph
        if self.analysis.get('code_graph'):
            graph_path = self.output_dir / 'code-graph.json'
            with open(graph_path, 'w') as f:
                json.dump(self.analysis['code_graph'], f, indent=2)
            console.print(f"[green]✅[/green] code-graph.json")


def print_summary(analysis: Dict[str, Any]) -> None:
    """Print analysis summary."""
    console.print("\n[bold blue]📊 Analysis Summary[/bold blue]\n")
    
    # Storage table
    storage = analysis.get('storage', {})
    ls = storage.get('localStorage', {})
    ss = storage.get('sessionStorage', {})
    
    table = Table(title="📊 Storage Statistics")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="magenta")
    
    table.add_row("localStorage Keys", str(ls.get('total_keys', 0)))
    table.add_row("localStorage Size", f"{ls.get('total_size_bytes', 0) / 1024 / 1024:.2f} MB")
    table.add_row("sessionStorage Keys", str(ss.get('total_keys', 0)))
    table.add_row("sessionStorage Size", f"{ss.get('total_size_bytes', 0) / 1024:.2f} KB")
    
    console.print(table)
    
    # IndexedDB table
    idb = analysis.get('indexeddb', {})
    total_records = 0
    total_stores = 0
    
    for db_name, db_info in idb.items():
        for store_name, store_info in db_info.get('stores', {}).items():
            total_records += store_info.get('record_count', 0)
            total_stores += 1
    
    table = Table(title="🗄️ IndexedDB Statistics")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="magenta")
    
    table.add_row("Databases", str(len(idb)))
    table.add_row("Stores", str(total_stores))
    table.add_row("Total Records", f"{total_records:,}")
    
    console.print(table)
    
    # Code analysis
    code = analysis.get('code_graph', {})
    if code.get('stats'):
        table = Table(title="🐍 Code Analysis")
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="magenta")
        
        table.add_row("Components", str(code['stats'].get('total_components', 0)))
        table.add_row("Dependencies", str(code['stats'].get('total_dependencies', 0)))
        
        console.print(table)


# ========================================
# CLI
# ========================================

@click.command()
@click.argument('dump_file', type=click.Path(exists=True))
@click.option('--analyze', is_flag=True, help='Perform full analysis')
@click.option('--export', type=str, default=None, help='Export sections (comma-separated)')
@click.option('--format', type=click.Choice(['json', 'gz', 'jsonl']), default='gz', help='Export format')
@click.option('--analyze-deps', is_flag=True, help='Analyze code dependencies')
@click.option('--output', type=click.Path(), default='./dumps', help='Output directory')
def main(dump_file, analyze, export, format, analyze_deps, output):
    """
    🐍 Analyze and export Perplexity Storage Dumps.
    
    Examples:
        python analyze-dump.py dump.json --analyze
        python analyze-dump.py dump.json --export storage,indexeddb --format gz
        python analyze-dump.py dump.json --analyze-deps --output ./results
    """
    
    console.print("\n[bold blue]🐍 Perplexity Storage Dump Analyzer[/bold blue]")
    console.print(f"[dim]File: {dump_file}[/dim]\n")
    
    # Load dump
    dump_path = Path(dump_file)
    data = DumpLoader.load(dump_path)
    
    if not DumpLoader.validate(data):
        console.print("[red]❌ Invalid dump structure[/red]")
        sys.exit(1)
    
    console.print("[green]✅ Dump loaded successfully[/green]\n")
    
    # Initialize pipeline
    pipeline = AnalysisPipeline(data, output)
    
    # Run analysis
    if analyze or analyze_deps:
        analysis = pipeline.run_all()
        print_summary(analysis)
        pipeline.generate_reports()
    
    # Export sections
    if export:
        sections = [s.strip() for s in export.split(',')]
        pipeline.export_sections(sections, format)
    
    console.print("\n[green][bold]✅ Done![/bold][/green]\n")


if __name__ == '__main__':
    main()
