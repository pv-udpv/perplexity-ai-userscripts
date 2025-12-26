import type { IndexedDBData, IndexedDBStore } from '../types';

function openDB(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store: IDBObjectStore): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function dumpIndexedDB(
  onProgress?: (current: number, total: number) => void
): Promise<IndexedDBData[]> {
  const databases = await indexedDB.databases();
  const dumps: IndexedDBData[] = [];

  for (let dbIdx = 0; dbIdx < databases.length; dbIdx++) {
    const dbInfo = databases[dbIdx];
    
    try {
      const db = await openDB(dbInfo.name!);
      const dump: IndexedDBData = {
        name: dbInfo.name!,
        version: dbInfo.version!,
        stores: [],
      };

      const storeNames = Array.from(db.objectStoreNames);
      
      for (let storeIdx = 0; storeIdx < storeNames.length; storeIdx++) {
        const storeName = storeNames[storeIdx];
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        
        const allRecords = await getAllFromStore(store);

        dump.stores.push({
          name: storeName,
          keyPath: store.keyPath,
          autoIncrement: store.autoIncrement,
          indexes: Array.from(store.indexNames),
          records: allRecords,
          count: allRecords.length,
        });

        if (onProgress) {
          const progress = ((dbIdx * storeNames.length + storeIdx + 1) / (databases.length * storeNames.length)) * 100;
          onProgress(progress, 100);
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
