// ==UserScript==
// @name         Perplexity Storage Dumper
// @namespace    https://github.com/pv-udpv/perplexity-ai-plug
// @version      1.2.0
// @description  Dump all Perplexity.ai runtime context (storage, caches, state) to JSON for offline analysis
// @author       pv-udpv
// @match        https://www.perplexity.ai/*
// @grant        none
// @run-at       document-idle
// @license      MIT
// @homepageURL  https://github.com/pv-udpv/perplexity-ai-plug
// @supportURL   https://github.com/pv-udpv/perplexity-ai-plug/issues
// @updateURL    https://gist.githubusercontent.com/pv-udpv/8c0bafb4af72141a40f207b964b68725/raw/perplexity-dumper.user.js
// @downloadURL  https://gist.githubusercontent.com/pv-udpv/8c0bafb4af72141a40f207b964b68725/raw/perplexity-dumper.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ========================================
    // Configuration
    // ========================================

    const CONFIG = {
        // Truncation settings
        MAX_STRING_LENGTH: 1000,           // Characters before truncation
        MAX_PREVIEW_LENGTH: 200,           // Preview length in truncated.preview
        MAX_PARSED_DEPTH: 3,               // Max depth for parsed JSON objects
        MAX_ARRAY_ITEMS: 10,               // Max array items to include
        
        // Cache settings
        CACHE_DOWNLOAD_BODIES: true,       // Download actual cached content
        CACHE_MAX_BODY_SIZE: 500000,       // Max body size (500KB per file)
        CACHE_INCLUDE_TYPES: [             // Content types to include
            'text/javascript',
            'application/javascript',
            'text/css',
            'text/html',
            'application/json',
            'application/x-javascript',
        ],
        CACHE_TRUNCATE_BODIES: true,       // Truncate large bodies
        
        // What to include in output
        INCLUDE_RAW_VALUE: true,           // Keep original value (can be huge)
        INCLUDE_TRUNCATED_PREVIEW: true,   // Add preview of truncated content
        INCLUDE_PARSED_LIMITED: true,      // Add depth-limited parsed JSON
    };

    // ========================================
    // Utility Functions
    // ========================================

    function tryParseJSON(value) {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }

    function limitDepth(obj, maxDepth, currentDepth = 0) {
        if (currentDepth >= maxDepth) {
            if (Array.isArray(obj)) {
                return `[Array(${obj.length})]`;
            } else if (obj !== null && typeof obj === 'object') {
                return `{Object: ${Object.keys(obj).length} keys}`;
            }
            return obj;
        }

        if (Array.isArray(obj)) {
            const limited = obj.slice(0, CONFIG.MAX_ARRAY_ITEMS).map(item => 
                limitDepth(item, maxDepth, currentDepth + 1)
            );
            if (obj.length > CONFIG.MAX_ARRAY_ITEMS) {
                limited.push(`... +${obj.length - CONFIG.MAX_ARRAY_ITEMS} more`);
            }
            return limited;
        }

        if (obj !== null && typeof obj === 'object') {
            const limited = {};
            const keys = Object.keys(obj);
            for (const key of keys) {
                limited[key] = limitDepth(obj[key], maxDepth, currentDepth + 1);
            }
            return limited;
        }

        return obj;
    }

    function processStorageValue(value) {
        const size = new Blob([value]).size;
        const isTruncated = value.length > CONFIG.MAX_STRING_LENGTH;
        
        const entry = {
            size: size,
            truncated: isTruncated,
        };

        // Always include raw value (for scripted analysis)
        if (CONFIG.INCLUDE_RAW_VALUE) {
            entry.value = value;
        }

        // Add preview if truncated
        if (isTruncated && CONFIG.INCLUDE_TRUNCATED_PREVIEW) {
            entry.preview = value.substring(0, CONFIG.MAX_PREVIEW_LENGTH) + '...';
            entry.truncated_at = CONFIG.MAX_STRING_LENGTH;
            entry.original_length = value.length;
        }

        // Try to parse JSON
        const parsed = tryParseJSON(value);
        if (parsed !== null) {
            if (CONFIG.INCLUDE_PARSED_LIMITED) {
                // Depth-limited version for readability
                entry.parsed_preview = limitDepth(parsed, CONFIG.MAX_PARSED_DEPTH);
            }
            // Full parsed (can be huge)
            entry.parsed = parsed;
        }

        return entry;
    }

    function shouldIncludeCacheEntry(contentType) {
        if (!CONFIG.CACHE_DOWNLOAD_BODIES) return false;
        if (!contentType) return false;
        
        return CONFIG.CACHE_INCLUDE_TYPES.some(type => 
            contentType.toLowerCase().includes(type.toLowerCase())
        );
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ========================================
    // Dumpers
    // ========================================

    async function dumpStorage() {
        const data = {
            localStorage: {},
            sessionStorage: {},
            size: { local: 0, session: 0 },
            stats: {
                local: { total: 0, truncated: 0 },
                session: { total: 0, truncated: 0 }
            }
        };

        // localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            const entry = processStorageValue(value);
            
            data.localStorage[key] = entry;
            data.size.local += entry.size;
            data.stats.local.total++;
            if (entry.truncated) data.stats.local.truncated++;
        }

        // sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            const value = sessionStorage.getItem(key);
            const entry = processStorageValue(value);
            
            data.sessionStorage[key] = entry;
            data.size.session += entry.size;
            data.stats.session.total++;
            if (entry.truncated) data.stats.session.truncated++;
        }

        return data;
    }

    async function dumpIndexedDB(onProgress) {
        const databases = await indexedDB.databases();
        const dumps = [];

        for (let dbIdx = 0; dbIdx < databases.length; dbIdx++) {
            const dbInfo = databases[dbIdx];

            try {
                const db = await new Promise((resolve, reject) => {
                    const request = indexedDB.open(dbInfo.name);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });

                const dump = {
                    name: dbInfo.name,
                    version: dbInfo.version,
                    stores: []
                };

                const storeNames = Array.from(db.objectStoreNames);

                for (let storeIdx = 0; storeIdx < storeNames.length; storeIdx++) {
                    const storeName = storeNames[storeIdx];
                    const tx = db.transaction(storeName, 'readonly');
                    const store = tx.objectStore(storeName);

                    const allRecords = await new Promise((resolve, reject) => {
                        const request = store.getAll();
                        request.onsuccess = () => resolve(request.result);
                        request.onerror = () => reject(request.error);
                    });

                    dump.stores.push({
                        name: storeName,
                        keyPath: store.keyPath,
                        autoIncrement: store.autoIncrement,
                        indexes: Array.from(store.indexNames),
                        records: allRecords,
                        count: allRecords.length
                    });

                    if (onProgress) {
                        onProgress(storeIdx + 1, storeNames.length);
                    }
                }

                dumps.push(dump);
                db.close();
            } catch (error) {
                console.error(`Failed to dump IndexedDB ${dbInfo.name}:`, error);
            }
        }

        return dumps;
    }

    async function dumpCaches() {
        if (!('caches' in window)) {
            return { caches: [], stats: { total: 0, downloaded: 0, skipped: 0 } };
        }

        try {
            const cacheNames = await caches.keys();
            const dumps = [];
            let totalEntries = 0;
            let downloadedBodies = 0;
            let skippedBodies = 0;

            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const requests = await cache.keys();

                const entries = [];
                
                for (const req of requests) {
                    totalEntries++;
                    
                    const entry = {
                        url: req.url,
                        method: req.method,
                        headers: Object.fromEntries(req.headers.entries()),
                        cached_at: new Date().toISOString(),
                    };

                    // Try to get response body
                    try {
                        const response = await cache.match(req);
                        if (response) {
                            const contentType = response.headers.get('content-type') || '';
                            entry.response = {
                                status: response.status,
                                statusText: response.statusText,
                                headers: Object.fromEntries(response.headers.entries()),
                                contentType: contentType,
                            };

                            // Download body if matches filter
                            if (shouldIncludeCacheEntry(contentType)) {
                                try {
                                    const text = await response.text();
                                    const size = new Blob([text]).size;
                                    
                                    entry.response.bodySize = size;
                                    
                                    // Truncate if too large
                                    if (CONFIG.CACHE_TRUNCATE_BODIES && size > CONFIG.CACHE_MAX_BODY_SIZE) {
                                        entry.response.body = text.substring(0, CONFIG.CACHE_MAX_BODY_SIZE);
                                        entry.response.bodyTruncated = true;
                                        entry.response.originalSize = size;
                                    } else {
                                        entry.response.body = text;
                                        entry.response.bodyTruncated = false;
                                    }
                                    
                                    downloadedBodies++;
                                } catch (bodyError) {
                                    console.warn(`Failed to read body for ${req.url}:`, bodyError);
                                    entry.response.bodyError = bodyError.message;
                                    skippedBodies++;
                                }
                            } else {
                                entry.response.bodySkipped = true;
                                entry.response.skipReason = 'Content type not in filter';
                                skippedBodies++;
                            }
                        }
                    } catch (responseError) {
                        console.warn(`Failed to match response for ${req.url}:`, responseError);
                        entry.responseError = responseError.message;
                    }

                    entries.push(entry);
                }

                dumps.push({
                    name: cacheName,
                    entries: entries,
                    count: entries.length
                });
            }

            return {
                caches: dumps,
                stats: {
                    total: totalEntries,
                    downloaded: downloadedBodies,
                    skipped: skippedBodies
                }
            };
        } catch (error) {
            console.error('Failed to dump caches:', error);
            return { caches: [], stats: { total: 0, downloaded: 0, skipped: 0, error: error.message } };
        }
    }

    function parseCookies() {
        return document.cookie.split(';').map(cookie => {
            const [name, ...valueParts] = cookie.trim().split('=');
            return {
                name: name.trim(),
                value: valueParts.join('=').trim()
            };
        }).filter(c => c.name);
    }

    function dumpSPAState() {
        const state = {
            react: null,
            vue: null,
            globalObjects: {},
            router: null
        };

        // React DevTools
        const reactRoot = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (reactRoot && reactRoot.renderers && reactRoot.renderers.size) {
            state.react = {
                available: true,
                version: reactRoot.version
            };
        }

        // Vue DevTools
        if (window.__VUE__) {
            state.vue = window.__VUE__;
        }

        // Global Perplexity objects
        Object.keys(window)
            .filter(key => key.startsWith('_pplx') || key.startsWith('__PPLX') || key.includes('perplexity'))
            .forEach(key => {
                try {
                    state.globalObjects[key] = window[key];
                } catch (error) {
                    state.globalObjects[key] = `<Error: ${error}>`;
                }
            });

        // Router state
        if (window.location) {
            state.router = {
                pathname: window.location.pathname,
                search: window.location.search,
                hash: window.location.hash,
                state: window.history.state
            };
        }

        return state;
    }

    const activeWebSockets = new Set();
    const pendingFetches = new Set();

    // Hook WebSocket
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = class extends OriginalWebSocket {
        constructor(...args) {
            super(...args);
            activeWebSockets.add(this);
            this.addEventListener('close', () => {
                activeWebSockets.delete(this);
            });
        }
    };

    // Hook fetch
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const url = args[0]?.toString() || 'unknown';
        pendingFetches.add(url);
        try {
            return await originalFetch.apply(this, args);
        } finally {
            pendingFetches.delete(url);
        }
    };

    function dumpNetworkState() {
        const websockets = [];
        activeWebSockets.forEach(ws => {
            websockets.push({
                url: ws.url,
                readyState: ws.readyState,
                protocol: ws.protocol
            });
        });

        return {
            websockets: websockets,
            serviceWorker: {
                registered: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
                scope: navigator.serviceWorker?.controller?.scriptURL,
                state: navigator.serviceWorker?.controller?.state
            },
            pendingRequests: Array.from(pendingFetches)
        };
    }

    // ========================================
    // UI Components
    // ========================================

    class DumpButton {
        constructor() {
            this.button = this.createButton();
            document.body.appendChild(this.button);
        }

        createButton() {
            const button = document.createElement('button');
            button.textContent = '📦 Dump';
            button.title = 'Dump app state (Ctrl+Shift+D)';

            Object.assign(button.style, {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: '999999',
                padding: '12px 20px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s'
            });

            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
            });

            return button;
        }

        onClick(handler) {
            this.button.addEventListener('click', handler);
        }
    }

    class ProgressModal {
        constructor() {
            this.modal = this.createModal();
            this.progressBar = this.modal.querySelector('.progress-bar');
            this.statusList = this.modal.querySelector('.status-list');
            this.cancelButton = this.modal.querySelector('.cancel-btn');
            this.statusItems = new Map();
            document.body.appendChild(this.modal);
        }

        createModal() {
            const modal = document.createElement('div');
            modal.innerHTML = `
                <div class="modal-overlay" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000000;
                ">
                    <div class="modal-content" style="
                        background: white;
                        border-radius: 12px;
                        padding: 24px;
                        width: 400px;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    ">
                        <h2 style="
                            margin: 0 0 16px 0;
                            font-size: 18px;
                            font-weight: 600;
                            color: #1f2937;
                        ">🔄 Dumping Perplexity State...</h2>

                        <div class="progress-container" style="
                            height: 8px;
                            background: #e5e7eb;
                            border-radius: 4px;
                            overflow: hidden;
                            margin-bottom: 16px;
                        ">
                            <div class="progress-bar" style="
                                height: 100%;
                                background: linear-gradient(90deg, #2563eb, #3b82f6);
                                transition: width 0.3s;
                                width: 0%;
                            "></div>
                        </div>

                        <div class="status-list" style="
                            margin-bottom: 16px;
                            font-size: 14px;
                            color: #4b5563;
                        "></div>

                        <button class="cancel-btn" style="
                            width: 100%;
                            padding: 10px;
                            background: #ef4444;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                        ">Cancel</button>
                    </div>
                </div>
            `;

            modal.style.display = 'none';
            return modal;
        }

        show() {
            this.modal.style.display = 'flex';
            this.statusItems.clear();
            this.statusList.innerHTML = '';
            this.setProgress(0);
        }

        hide() {
            this.modal.style.display = 'none';
        }

        setProgress(percent) {
            this.progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
        }

        setStatus(label, status) {
            let item = this.statusItems.get(label);

            if (!item) {
                item = document.createElement('div');
                item.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 8px;';
                this.statusList.appendChild(item);
                this.statusItems.set(label, item);
            }

            const icons = {
                pending: '⏸️',
                loading: '⏳',
                complete: '✅',
                error: '❌'
            };

            item.innerHTML = `
                <span>${icons[status]}</span>
                <span>${label}</span>
            `;
        }

        setComplete(message) {
            const h2 = this.modal.querySelector('h2');
            if (h2) h2.textContent = message;
            this.cancelButton.style.display = 'none';
        }

        setError(message) {
            const h2 = this.modal.querySelector('h2');
            if (h2) h2.textContent = message;
            this.cancelButton.textContent = 'Close';
        }

        onCancel(handler) {
            this.cancelButton.onclick = handler;
        }
    }

    // ========================================
    // Main Dumper
    // ========================================

    class PerplexityDumper {
        constructor() {
            this.button = new DumpButton();
            this.modal = new ProgressModal();
            this.abortController = null;

            this.button.onClick(() => this.startDump());

            // Keyboard shortcut: Ctrl+Shift+D
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                    e.preventDefault();
                    this.startDump();
                }
            });
        }

        async startDump() {
            this.abortController = new AbortController();
            const signal = this.abortController.signal;

            this.modal.show();
            this.modal.onCancel(() => {
                this.abortController.abort();
                this.modal.hide();
            });

            try {
                const dump = await this.collectData(signal);
                await this.exportData(dump);

                this.modal.setComplete('✅ Dump completed successfully!');
                setTimeout(() => this.modal.hide(), 2000);
            } catch (error) {
                if (signal.aborted) {
                    this.modal.setError('❌ Dump cancelled by user');
                } else {
                    console.error('Dump error:', error);
                    this.modal.setError(`❌ Error: ${error.message}`);
                }
                setTimeout(() => this.modal.hide(), 3000);
            }
        }

        async collectData(signal) {
            const data = {
                metadata: {
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    },
                    script_version: '1.2.0',
                    config: CONFIG
                },
                storage: null,
                indexedDB: [],
                caches: null,
                cookies: [],
                state: null,
                network: null
            };

            const steps = [
                {
                    label: 'localStorage/sessionStorage',
                    fn: async () => (data.storage = await dumpStorage())
                },
                {
                    label: 'IndexedDB',
                    fn: async () => (data.indexedDB = await dumpIndexedDB((curr, total) => {
                        this.modal.setProgress((curr / total) * 100);
                    }))
                },
                {
                    label: 'Cache API + Bodies',
                    fn: async () => (data.caches = await dumpCaches())
                },
                {
                    label: 'Cookies',
                    fn: async () => (data.cookies = parseCookies())
                },
                {
                    label: 'SPA State',
                    fn: async () => (data.state = dumpSPAState())
                },
                {
                    label: 'Network State',
                    fn: async () => (data.network = dumpNetworkState())
                }
            ];

            for (let i = 0; i < steps.length; i++) {
                if (signal.aborted) throw new Error('Aborted');

                const step = steps[i];
                this.modal.setStatus(step.label, 'loading');

                try {
                    await step.fn();
                    this.modal.setStatus(step.label, 'complete');
                } catch (error) {
                    console.error(`Error dumping ${step.label}:`, error);
                    this.modal.setStatus(step.label, 'error');
                }

                this.modal.setProgress(((i + 1) / steps.length) * 100);
            }

            return data;
        }

        async exportData(dump) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `perplexity-dump_${timestamp}.json`;
            const json = JSON.stringify(dump, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            
            // Log stats
            console.log('📊 Dump Statistics:');
            console.log(`  localStorage: ${dump.storage.stats.local.total} keys (${dump.storage.stats.local.truncated} truncated)`);
            console.log(`  sessionStorage: ${dump.storage.stats.session.total} keys (${dump.storage.stats.session.truncated} truncated)`);
            console.log(`  IndexedDB: ${dump.indexedDB.length} databases`);
            console.log(`  Caches: ${dump.caches.stats.total} entries (${dump.caches.stats.downloaded} bodies downloaded, ${dump.caches.stats.skipped} skipped)`);
            console.log(`  File size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
            
            downloadBlob(blob, filename);
        }
    }

    // ========================================
    // Initialize
    // ========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new PerplexityDumper());
    } else {
        new PerplexityDumper();
    }

    console.log('📦 Perplexity Storage Dumper v1.2.0 loaded.');
    console.log('   Press Ctrl+Shift+D to dump state.');
    console.log('   Cache body download:', CONFIG.CACHE_DOWNLOAD_BODIES ? 'ENABLED' : 'DISABLED');
    console.log('   Config:', CONFIG);
})();
