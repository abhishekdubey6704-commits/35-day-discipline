export type StoreName = 'records' | 'challenges' | 'profile' | 'settings' | 'trash'

const DB_NAME = 'thirty-five-discipline'
const DB_VERSION = 1
let databasePromise: Promise<IDBDatabase> | undefined

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB is unavailable'))
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        for (const name of ['records', 'challenges', 'profile', 'settings', 'trash']) {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' })
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('Unable to open local database'))
      request.onblocked = () => reject(new Error('Database upgrade is blocked by another app window'))
    })
  }
  return databasePromise
}

export async function readAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = db.transaction(store, 'readonly').objectStore(store).getAll()
    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error ?? new Error('Unable to read local data'))
  })
}

export async function writeAll<T extends { id: string }>(store: StoreName, values: T[]): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite')
    const objectStore = transaction.objectStore(store)
    objectStore.clear()
    for (const value of values) objectStore.put(value)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to save local data'))
    transaction.onabort = () => reject(transaction.error ?? new Error('Local data transaction was aborted'))
  })
}

export async function readOne<T>(store: StoreName, id: string): Promise<T | undefined> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = db.transaction(store, 'readonly').objectStore(store).get(id)
    request.onsuccess = () => resolve(request.result as T | undefined)
    request.onerror = () => reject(request.error ?? new Error('Unable to read local item'))
  })
}

export async function writeOne<T extends { id: string }>(store: StoreName, value: T): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite')
    transaction.objectStore(store).put(value)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to save local item'))
    transaction.onabort = () => reject(transaction.error ?? new Error('Local data transaction was aborted'))
  })
}

export async function deleteOne(store: StoreName, id: string): Promise<void> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite')
    transaction.objectStore(store).delete(id)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to delete local item'))
  })
}

export async function migrateLegacy<T extends { id: string }>(store: StoreName, legacyKey: string): Promise<T[]> {
  const existing = await readAll<T>(store)
  if (existing.length) return existing
  try {
    const raw = localStorage.getItem(legacyKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as T[]
    if (!Array.isArray(parsed)) return []
    await writeAll(store, parsed)
    return parsed
  } catch {
    return []
  }
}

export async function exportDatabase(): Promise<Record<string, unknown[]>> {
  const [records, challenges, profile, settings, trash] = await Promise.all([
    readAll<unknown>('records'), readAll<unknown>('challenges'), readAll<unknown>('profile'),
    readAll<unknown>('settings'), readAll<unknown>('trash')
  ])
  return { records, challenges, profile, settings, trash }
}

export async function restoreDatabase(data: Record<string, unknown>): Promise<void> {
  const stores: StoreName[] = ['records', 'challenges', 'profile', 'settings', 'trash']
  for (const store of stores) {
    const value = data[store]
    if (Array.isArray(value)) await writeAll(store, value as { id: string }[])
  }
}
