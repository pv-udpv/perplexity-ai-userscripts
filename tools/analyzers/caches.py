"""Cache API analyzer."""

from typing import Dict, Any
from collections import defaultdict


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
