"""localStorage/sessionStorage analyzer."""

from typing import Dict, Any, List
from collections import defaultdict, Counter
import re


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
            # Detect prefix pattern (word_*) - case insensitive, allowing numbers
            match = re.match(r'^([a-zA-Z0-9_]+?)_', key, re.IGNORECASE)
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
