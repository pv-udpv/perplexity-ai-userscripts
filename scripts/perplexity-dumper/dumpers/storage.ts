import type { StorageData, StorageEntry } from '../types';

function tryParseJSON(value: string): { parsed: any; isValid: boolean } {
  try {
    return { parsed: JSON.parse(value), isValid: true };
  } catch {
    return { parsed: null, isValid: false };
  }
}

export async function dumpStorage(): Promise<StorageData> {
  const data: StorageData = {
    localStorage: {},
    sessionStorage: {},
    size: { local: 0, session: 0 },
  };

  // localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    const value = localStorage.getItem(key)!;
    const size = new Blob([value]).size;
    const parseResult = tryParseJSON(value);
    
    data.localStorage[key] = {
      value,
      size,
      parsed: parseResult.parsed,
      isValidJSON: parseResult.isValid,
    };
    data.size.local += size;
  }

  // sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)!;
    const value = sessionStorage.getItem(key)!;
    const size = new Blob([value]).size;
    const parseResult = tryParseJSON(value);
    
    data.sessionStorage[key] = {
      value,
      size,
      parsed: parseResult.parsed,
      isValidJSON: parseResult.isValid,
    };
    data.size.session += size;
  }

  return data;
}
