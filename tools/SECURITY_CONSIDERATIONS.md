# Security Considerations for Follow-Up Features

## ⚠️ Important Security Notes

This document outlines security considerations that **MUST** be addressed during implementation of the four follow-up features.

---

## 🔒 General Security Principles

### 1. Input Validation
- **Always validate** all user inputs before processing
- **Sanitize** file uploads and JSON data
- **Limit** file sizes and processing time
- **Reject** malformed or suspicious data

### 2. Code Execution
- **Never** use `eval()` in production code
- **Sandbox** all code execution environments
- **Whitelist** allowed operations
- **Log** all execution attempts for auditing

### 3. External Dependencies
- **Verify** integrity of all CDN resources with SRI hashes
- **Pin** versions of external libraries
- **Audit** third-party dependencies regularly
- **Consider** self-hosting critical dependencies

### 4. Network Security
- **Use** TLS/WSS for all network connections
- **Validate** WebSocket origins
- **Implement** rate limiting
- **Monitor** for suspicious activity

---

## 🛡️ Feature-Specific Security

### Feature 1: TypeScript/JS Analysis

#### Risks
- Malicious code in dump files could exploit parser vulnerabilities
- AST parsing of untrusted code may trigger denial of service
- Node.js subprocess calls could be exploited

#### Mitigations
```python
# ✅ SECURE: Use shell=False and timeout
subprocess.run(
    ['node', 'ts-extractor.js', temp_file],
    shell=False,  # Prevent shell injection
    timeout=30,   # Prevent hanging
    check=True,
    capture_output=True
)

# ✅ SECURE: Validate input before parsing
def parse_code(code: str, max_size: int = 1_000_000):
    if len(code) > max_size:
        raise ValueError(f"Code too large: {len(code)} bytes")
    
    if not code.strip():
        return {}
    
    try:
        tree = esprima.parse(code, options={
            'jsx': True,
            'tolerant': True,
            'range': False,  # Reduce attack surface
            'loc': False
        })
        return tree
    except Exception as e:
        logger.warning(f"Failed to parse code: {e}")
        return {}
```

#### Action Items
- [ ] Add input size limits (default: 1MB per file)
- [ ] Use `shell=False` in all subprocess calls
- [ ] Add timeouts to prevent DoS
- [ ] Validate AST output before processing
- [ ] Sanitize file paths in error messages

---

### Feature 2: API Schema Extraction

#### Risks
- Network request data may contain sensitive information
- Schema inference could expose internal API structure
- Component-to-API mapping might reveal security vulnerabilities

#### Mitigations
```python
# ✅ SECURE: Sanitize sensitive data before export
def sanitize_request(request: Dict) -> Dict:
    """Remove sensitive headers and data."""
    sensitive_headers = {
        'authorization', 'cookie', 'x-api-key', 
        'x-auth-token', 'set-cookie'
    }
    
    sanitized = request.copy()
    
    # Remove sensitive headers
    if 'headers' in sanitized:
        sanitized['headers'] = {
            k: v for k, v in sanitized['headers'].items()
            if k.lower() not in sensitive_headers
        }
    
    # Redact tokens in body
    if 'body' in sanitized:
        sanitized['body'] = redact_tokens(sanitized['body'])
    
    return sanitized

# ✅ SECURE: Warn about sensitive data in schemas
def generate_openapi(network_data: Dict) -> Dict:
    spec = {...}
    
    # Add security note in description
    spec['info']['description'] = (
        "Auto-generated API schema. "
        "⚠️ May contain sensitive endpoints. Review before sharing."
    )
    
    return spec
```

#### Action Items
- [ ] Implement data sanitization for sensitive headers
- [ ] Add opt-in flag for including sensitive data
- [ ] Warn users about sharing OpenAPI specs
- [ ] Redact authentication tokens from examples
- [ ] Add security section to generated specs

---

### Feature 3: JupyterLite Integration

#### Risks
- **CRITICAL**: WebSocket bridge allows remote code execution
- **CRITICAL**: `eval()` in browser context is extremely dangerous
- Jupyter notebooks can execute arbitrary Python/JavaScript
- WebSocket connections may be hijacked

#### Mitigations
```typescript
// ❌ INSECURE: eval() allows arbitrary code execution
executeCode(message: WSMessage) {
    const result = eval(message.payload.code);  // DANGEROUS!
    this.sendResponse(message.id, 'success', result);
}

// ✅ SECURE: Sandboxed execution with whitelist
class SecureExecutor {
    private allowedFunctions = new Set([
        'localStorage.getItem',
        'localStorage.setItem',
        'sessionStorage.getItem',
        'JSON.parse',
        'JSON.stringify'
    ]);
    
    executeCode(message: WSMessage): any {
        const { code, context } = message.payload;
        
        // Validate code against whitelist
        if (!this.isCodeAllowed(code)) {
            throw new Error('Unauthorized operation');
        }
        
        // Execute in restricted context
        try {
            return this.executeInSandbox(code, context);
        } catch (error) {
            throw new Error(`Execution failed: ${error.message}`);
        }
    }
    
    private isCodeAllowed(code: string): boolean {
        // Parse code and check against whitelist
        const operations = this.extractOperations(code);
        return operations.every(op => this.allowedFunctions.has(op));
    }
    
    private executeInSandbox(code: string, context: any): any {
        // Use iframe or Web Worker for sandboxing
        const sandbox = new Worker('sandbox-worker.js');
        return new Promise((resolve, reject) => {
            sandbox.postMessage({ code, context });
            sandbox.onmessage = (e) => resolve(e.data);
            sandbox.onerror = (e) => reject(e);
        });
    }
}

// ✅ SECURE: Validate WebSocket origin
connect() {
    this.ws = new WebSocket(this.jupyterUrl);
    
    this.ws.onopen = () => {
        // Verify origin
        if (!this.isOriginAllowed(this.jupyterUrl)) {
            this.ws.close();
            throw new Error('Invalid origin');
        }
        
        // Authenticate connection
        this.authenticate();
    };
}

private isOriginAllowed(url: string): boolean {
    const allowedOrigins = [
        'ws://localhost:8888',
        'wss://jupyter.perplexity.local'
    ];
    return allowedOrigins.some(origin => url.startsWith(origin));
}
```

#### Action Items
- [ ] **CRITICAL**: Remove all `eval()` usage
- [ ] Implement sandboxed execution environment
- [ ] Add WebSocket origin validation
- [ ] Implement authentication for WebSocket connections
- [ ] Use Web Workers or iframes for code isolation
- [ ] Add rate limiting for code execution requests
- [ ] Log all execution attempts for security audit
- [ ] Add user confirmation for sensitive operations

---

### Feature 4: StackBlitz Integration

#### Risks
- External CDN scripts without integrity checks
- Pyodide execution of untrusted Python code
- Large file uploads may cause browser crashes

#### Mitigations
```html
<!-- ❌ INSECURE: No integrity check -->
<script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"></script>

<!-- ✅ SECURE: With SRI hash -->
<script 
  src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"
  integrity="sha384-HASH_HERE"
  crossorigin="anonymous"
></script>

<!-- ✅ BETTER: Self-hosted with version pinning -->
<script src="/static/pyodide/v0.25.0/pyodide.js"></script>
```

```typescript
// ✅ SECURE: File upload validation
async function handleFileUpload(file: File) {
    // Size limit
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
        throw new Error('File too large');
    }
    
    // Type validation
    if (file.type !== 'application/json') {
        throw new Error('Invalid file type');
    }
    
    // Parse and validate
    const text = await file.text();
    try {
        const data = JSON.parse(text);
        validateDumpStructure(data);
        return data;
    } catch (error) {
        throw new Error('Invalid dump file');
    }
}

// ✅ SECURE: Pyodide execution timeout
async function runPythonCode(code: string, timeout: number = 30000) {
    return Promise.race([
        pyodide.runPythonAsync(code),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
        )
    ]);
}
```

#### Action Items
- [ ] Add SRI hashes to all CDN resources
- [ ] Consider self-hosting Pyodide
- [ ] Implement file size limits (50MB max)
- [ ] Add execution timeouts for Python code
- [ ] Validate JSON structure before processing
- [ ] Add memory usage monitoring
- [ ] Implement rate limiting for analysis runs

---

## 🔐 Implementation Checklist

Before merging any feature implementation:

### Code Security
- [ ] No use of `eval()` or `Function()` constructor
- [ ] All subprocess calls use `shell=False`
- [ ] All network requests validate origins
- [ ] All file operations validate paths
- [ ] All user inputs are validated and sanitized

### Dependency Security
- [ ] All CDN resources have SRI hashes
- [ ] All dependencies are pinned to specific versions
- [ ] All dependencies have been security audited
- [ ] No known vulnerabilities in dependencies

### Data Security
- [ ] Sensitive data is sanitized before export
- [ ] Users are warned about sharing sensitive data
- [ ] Authentication tokens are redacted
- [ ] API keys are not exposed in logs

### Network Security
- [ ] WebSocket connections use WSS (TLS)
- [ ] WebSocket origins are validated
- [ ] Rate limiting is implemented
- [ ] Timeouts are set for all operations

### Testing
- [ ] Security tests are written and passing
- [ ] Penetration testing has been performed
- [ ] Fuzzing has been performed on parsers
- [ ] Code review focused on security

---

## 📚 References

### Security Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Python Security Best Practices](https://python.readthedocs.io/en/stable/library/security_warnings.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### Specific Vulnerabilities
- [CWE-94: Code Injection](https://cwe.mitre.org/data/definitions/94.html)
- [CWE-95: eval() Injection](https://cwe.mitre.org/data/definitions/95.html)
- [CWE-78: OS Command Injection](https://cwe.mitre.org/data/definitions/78.html)
- [CWE-346: Origin Validation Error](https://cwe.mitre.org/data/definitions/346.html)

### Tools
- [Bandit](https://bandit.readthedocs.io/) - Python security linter
- [ESLint Security Plugin](https://github.com/nodesecurity/eslint-plugin-security)
- [CodeQL](https://codeql.github.com/) - Static analysis
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency audit

---

## ⚠️ IMPORTANT

**This is a planning document.** All code examples are for illustration only and **MUST NOT** be used in production without proper security review and implementation of the mitigations described above.

**Security is everyone's responsibility.** If you see a security issue, report it immediately.

---

**Created**: 2025-12-25  
**Last Updated**: 2025-12-25  
**Status**: Security Guidelines
