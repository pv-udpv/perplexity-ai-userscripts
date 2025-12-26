"""Report generation and schema export."""

import json
from typing import Dict, Any
from datetime import datetime
from pathlib import Path


class SchemaExporter:
    """Export inferred schemas in various formats."""
    
    @staticmethod
    def to_json_schema(analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Convert analysis to JSON Schema format."""
        schemas = {}
        
        # IndexedDB schemas
        for db_name, db_info in analysis.get('indexeddb', {}).items():
            schemas[f'db_{db_name}'] = {}
            for store_name, store_info in db_info.get('stores', {}).items():
                schemas[f'db_{db_name}'][store_name] = {
                    'type': 'object',
                    'properties': store_info.get('schema', {}),
                    'metadata': {
                        'record_count': store_info.get('record_count', 0),
                        'key_path': store_info.get('key_path'),
                        'indexes': store_info.get('indexes', []),
                    }
                }
        
        return schemas
    
    @staticmethod
    def export_json(schema: Dict, path: Path) -> None:
        """Export schema as JSON."""
        with open(path, 'w') as f:
            json.dump(schema, f, indent=2)


class ReportGenerator:
    """Generate markdown analysis reports."""
    
    @staticmethod
    def generate(analysis: Dict[str, Any], output: Path) -> None:
        """Generate comprehensive markdown report."""
        timestamp = datetime.now().isoformat()
        
        report = f"""# Perplexity Storage Dump Analysis Report

**Generated**: {timestamp}

---

## 📊 Executive Summary
"""
        
        # Storage section
        storage = analysis.get('storage', {})
        ls = storage.get('localStorage', {})
        ss = storage.get('sessionStorage', {})
        
        report += f"""\n### Storage

- **localStorage**: {ls.get('total_keys', 0)} keys ({ls.get('total_size_bytes', 0) / 1024 / 1024:.2f} MB)
- **sessionStorage**: {ss.get('total_keys', 0)} keys ({ss.get('total_size_bytes', 0) / 1024 / 1024:.2f} MB)
"""
        
        # IndexedDB section
        idb = analysis.get('indexeddb', {})
        total_records = 0
        for db_name, db_info in idb.items():
            for store_name, store_info in db_info.get('stores', {}).items():
                total_records += store_info.get('record_count', 0)
        
        report += f"""\n### IndexedDB

- **Databases**: {len(idb)}
- **Total Records**: {total_records:,}

"""
        
        # Detailed sections
        report += """---

## 🔍 Detailed Analysis

### localStorage Details

"""
        
        for pattern, count in ls.get('key_patterns', {}).items():
            report += f"- `{pattern}`: {count} keys\n"
        
        report += f"""\n**Size Distribution**:
- Min: {ls.get('value_sizes_bytes', {}).get('min', 0)} bytes
- Max: {ls.get('value_sizes_bytes', {}).get('max', 0) / 1024:.2f} KB
- Median: {ls.get('value_sizes_bytes', {}).get('median', 0) / 1024:.2f} KB
- Average: {ls.get('avg_value_size', 0) / 1024:.2f} KB

**Data Types**:
"""
        
        for dtype, count in ls.get('data_types', {}).items():
            report += f"- {dtype}: {count}\n"
        
        # IndexedDB detailed
        report += """\n### IndexedDB Stores

"""
        
        for db_name, db_info in idb.items():
            report += f"\n#### Database: {db_name} (v{db_info.get('version', '?')})\n\n"
            
            for store_name, store_info in db_info.get('stores', {}).items():
                report += f"**Store**: `{store_name}`\n\n"
                report += f"- Records: {store_info.get('record_count', 0):,}\n"
                report += f"- Key Path: `{store_info.get('key_path', 'N/A')}`\n"
                
                schema = store_info.get('schema', {})
                if schema:
                    report += "\n**Schema**:\n\n| Field | Type | Presence |\n|-------|------|----------|\n"
                    for field, info in schema.items():
                        field_type = info.get('type', 'unknown')
                        presence = info.get('presence', '?')
                        report += f"| `{field}` | {field_type} | {presence} |\n"
                
                cardinality = store_info.get('cardinality', {})
                if cardinality:
                    report += "\n**Cardinality**:\n\n"
                    for field, card in cardinality.items():
                        ratio = card.get('cardinality_ratio', 0) * 100
                        unique = card.get('unique_values', 0)
                        report += f"- `{field}`: {unique} unique values ({ratio:.0f}%)\n"
                
                report += "\n"
        
        # Code analysis
        code = analysis.get('code_graph', {})
        if code.get('stats'):
            report += f"""\n### Code Analysis

- Components: {code['stats'].get('total_components', 0)}
- Dependencies: {code['stats'].get('total_dependencies', 0)}

"""
        
        report += f"""\n---

## 📋 Metadata

- Report Generated: {timestamp}
- Analysis Tool: Perplexity Storage Dump Analyzer v1.0

"""
        
        with open(output, 'w') as f:
            f.write(report)
