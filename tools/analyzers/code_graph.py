"""Code dependency graph analyzer."""

from typing import Dict, Any, Set
from collections import defaultdict
import re


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
            'graph': {k: list(v) for k, v in self.imports.items()},  # Convert sets to lists
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
        parts = url.split('/')
        filename = parts[-1].split('?')[0]
        return filename.split('-')[0] if '-' in filename else filename
