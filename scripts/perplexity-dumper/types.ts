export interface DumpData {
  metadata: DumpMetadata;
  storage: StorageData;
  indexedDB: IndexedDBData[];
  caches: CacheData[];
  cookies: CookieData[];
  state: SPAStateData;
  network: NetworkData;
}

export interface DumpMetadata {
  timestamp: string;
  url: string;
  userAgent: string;
  viewport: { width: number; height: number };
  script_version: string;
}

export interface StorageData {
  localStorage: Record<string, StorageEntry>;
  sessionStorage: Record<string, StorageEntry>;
  size: { local: number; session: number };
}

export interface StorageEntry {
  value: string;
  size: number;
  parsed?: any;
  isValidJSON: boolean;
}

export interface IndexedDBData {
  name: string;
  version: number;
  stores: IndexedDBStore[];
}

export interface IndexedDBStore {
  name: string;
  keyPath: string | string[] | null;
  autoIncrement: boolean;
  indexes: string[];
  records: any[];
  count: number;
}

export interface CacheData {
  name: string;
  entries: CacheEntry[];
}

export interface CacheEntry {
  url: string;
  method: string;
  headers: Record<string, string>;
  dumped_at: string;
}

export interface CookieData {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
}

export interface SPAStateData {
  react: any;
  vue: any;
  globalObjects: Record<string, any>;
  router: {
    pathname: string;
    search: string;
    hash: string;
    state: any;
  } | null;
}

export interface NetworkData {
  websockets: WebSocketInfo[];
  serviceWorker: ServiceWorkerInfo;
  pendingRequests: string[];
}

export interface WebSocketInfo {
  url: string;
  readyState: number;
  protocol: string;
}

export interface ServiceWorkerInfo {
  registered: boolean;
  scope?: string;
  state?: string;
}

export interface ExportOptions {
  format: 'json' | 'json.gz';
  pretty: boolean;
  sections: DumpSection[];
}

export enum DumpSection {
  Storage = 'storage',
  IndexedDB = 'indexedDB',
  Caches = 'caches',
  Cookies = 'cookies',
  State = 'state',
  Network = 'network',
}

export type DumpStatus = 'pending' | 'loading' | 'complete' | 'error';
