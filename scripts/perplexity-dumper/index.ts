/**
 * Perplexity Storage Dumper
 * 
 * Dumps all Perplexity.ai runtime context to JSON for offline analysis.
 * 
 * Features:
 * - localStorage/sessionStorage
 * - IndexedDB full dump
 * - Cache API
 * - Cookies
 * - SPA state (React, global objects)
 * - Network state (WebSocket, ServiceWorker)
 * 
 * Keyboard shortcut: Ctrl+Shift+D
 */

import { dumpStorage } from './dumpers/storage';
import { dumpIndexedDB } from './dumpers/indexeddb';
import { dumpCaches } from './dumpers/cache';
import { dumpCookies } from './dumpers/cookies';
import { dumpSPAState } from './dumpers/spa-state';
import { dumpNetworkState } from './dumpers/network';
import { DumpButton } from './ui/button';
import { ProgressModal } from './ui/progress';
import { exportToJSON, exportToJSONGz } from './utils/export';
import type { DumpData, ExportOptions, DumpSection } from './types';

class PerplexityDumper {
  private button: DumpButton;
  private modal: ProgressModal;
  private abortController: AbortController | null = null;

  constructor() {
    this.button = new DumpButton();
    this.modal = new ProgressModal();
    
    this.button.onClick(() => this.startDump());
    
    // Keyboard shortcut: Ctrl+Shift+D
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.startDump();
      }
    });
  }

  async startDump(options?: Partial<ExportOptions>) {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const defaultOptions: ExportOptions = {
      format: 'json',
      pretty: true,
      sections: [
        DumpSection.Storage,
        DumpSection.IndexedDB,
        DumpSection.Caches,
        DumpSection.Cookies,
        DumpSection.State,
        DumpSection.Network,
      ],
      ...options,
    };

    this.modal.show();
    this.modal.onCancel(() => {
      this.abortController?.abort();
      this.modal.hide();
    });

    try {
      const dump = await this.collectData(defaultOptions, signal);
      await this.exportData(dump, defaultOptions);
      
      this.modal.setComplete('✅ Dump completed successfully!');
      setTimeout(() => this.modal.hide(), 2000);
    } catch (error) {
      if (signal.aborted) {
        this.modal.setError('❌ Dump cancelled by user');
      } else {
        console.error('Dump error:', error);
        this.modal.setError(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
      setTimeout(() => this.modal.hide(), 3000);
    }
  }

  private async collectData(options: ExportOptions, signal: AbortSignal): Promise<DumpData> {
    const data: DumpData = {
      metadata: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        script_version: '1.0.0',
      },
      storage: null as any,
      indexedDB: [],
      caches: [],
      cookies: [],
      state: null as any,
      network: null as any,
    };

    const steps = [
      {
        section: DumpSection.Storage,
        label: 'localStorage/sessionStorage',
        fn: async () => (data.storage = await dumpStorage()),
      },
      {
        section: DumpSection.IndexedDB,
        label: 'IndexedDB',
        fn: async () => (data.indexedDB = await dumpIndexedDB(this.modal.setProgress.bind(this.modal))),
      },
      {
        section: DumpSection.Caches,
        label: 'Cache API',
        fn: async () => (data.caches = await dumpCaches()),
      },
      {
        section: DumpSection.Cookies,
        label: 'Cookies',
        fn: async () => (data.cookies = await dumpCookies()),
      },
      {
        section: DumpSection.State,
        label: 'SPA State',
        fn: async () => (data.state = dumpSPAState()),
      },
      {
        section: DumpSection.Network,
        label: 'Network State',
        fn: async () => (data.network = dumpNetworkState()),
      },
    ];

    const enabledSteps = steps.filter((step) => options.sections.includes(step.section));
    
    for (let i = 0; i < enabledSteps.length; i++) {
      if (signal.aborted) throw new Error('Aborted');
      
      const step = enabledSteps[i];
      this.modal.setStatus(step.label, 'loading');
      
      try {
        await step.fn();
        this.modal.setStatus(step.label, 'complete');
      } catch (error) {
        console.error(`Error dumping ${step.label}:`, error);
        this.modal.setStatus(step.label, 'error');
      }
      
      this.modal.setProgress(((i + 1) / enabledSteps.length) * 100);
    }

    return data;
  }

  private async exportData(data: DumpData, options: ExportOptions) {
    const timestamp = new Date().toISOString().split('.')[0].replace(/:/g, '-');
    const filename = `perplexity-dump_${timestamp}`;

    if (options.format === 'json') {
      exportToJSON(data, filename, options.pretty);
    } else {
      await exportToJSONGz(data, filename);
    }
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PerplexityDumper());
} else {
  new PerplexityDumper();
}
