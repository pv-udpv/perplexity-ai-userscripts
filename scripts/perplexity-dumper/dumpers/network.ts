import type { NetworkData, WebSocketInfo } from '../types';

// Track active WebSockets
const activeWebSockets = new Set<WebSocket>();

// Track pending fetches
const pendingFetches = new Set<string>();

let hooksInstalled = false;

function ensureNetworkHooksInstalled(): void {
  if (hooksInstalled) {
    return;
  }

  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = class extends OriginalWebSocket {
    constructor(...args: any[]) {
      super(...args);
      activeWebSockets.add(this);
      this.addEventListener('close', () => {
        activeWebSockets.delete(this);
      });
    }
  } as any;

  const originalFetch = window.fetch;
  window.fetch = async function (...args: Parameters<typeof fetch>) {
    const url = args[0]?.toString() || 'unknown';
    pendingFetches.add(url);
    try {
      return await originalFetch.apply(this, args);
    } finally {
      pendingFetches.delete(url);
    }
  };

  hooksInstalled = true;
}

export function dumpNetworkState(): NetworkData {
  ensureNetworkHooksInstalled();

  const websockets: WebSocketInfo[] = [];
  
  activeWebSockets.forEach((ws) => {
    websockets.push({
      url: ws.url,
      readyState: ws.readyState,
      protocol: ws.protocol,
    });
  });

  return {
    websockets,
    serviceWorker: {
      registered: !!navigator.serviceWorker?.controller,
      scope: navigator.serviceWorker?.controller?.scriptURL,
      state: navigator.serviceWorker?.controller?.state,
    },
    pendingRequests: Array.from(pendingFetches),
  };
}
