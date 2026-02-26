/**
 * IndexedDB-backed save storage with localStorage fallback.
 * IndexedDB supports much larger payloads than localStorage (~5-10 MB limit).
 */

const DB_NAME = 'openmon';
const DB_VERSION = 1;
const STORE_NAME = 'saves';
const SAVES_KEY = 'all_saves';

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

export async function loadSaves(): Promise<string | null> {
	try {
		const db = await openDB();
		const result = await new Promise<string | null>((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, 'readonly');
			const store = tx.objectStore(STORE_NAME);
			const req = store.get(SAVES_KEY);
			req.onsuccess = () => resolve(req.result ?? null);
			req.onerror = () => reject(req.error);
		});
		if (result) return result;
	} catch {
		// IndexedDB unavailable
	}
	// Fallback to localStorage
	return localStorage.getItem('saves');
}

export async function persistSaves(data: string): Promise<void> {
	// Always write localStorage as synchronous fallback
	localStorage.setItem('saves', data);
	try {
		const db = await openDB();
		await new Promise<void>((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, 'readwrite');
			const store = tx.objectStore(STORE_NAME);
			const req = store.put(data, SAVES_KEY);
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
		});
	} catch {
		// IndexedDB unavailable, localStorage fallback already written
	}
}
