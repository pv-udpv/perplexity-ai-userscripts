/**
 * Global type declarations for Tampermonkey/Greasemonkey API.
 */

declare function GM_getValue(key: string, defaultValue?: string | null): string | null;
declare function GM_setValue(key: string, value: string): void;
declare function GM_xmlhttpRequest(details: {
  method?: string;
  url: string;
  headers?: Record<string, string>;
  data?: string;
  onload?: (response: { responseText: string; status: number }) => void;
  onerror?: (error: Error) => void;
}): void;
