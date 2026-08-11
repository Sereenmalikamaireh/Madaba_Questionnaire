"use client";

const DB_NAME = "mpa-index-field-db";
const DB_VERSION = 1;
const STORE = "submission_queue";

export type QueuedPayload = {
  id: string;
  queuedAt: string;
  payload: unknown;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queuePayload(id: string, payload: unknown) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ id, queuedAt: new Date().toISOString(), payload } satisfies QueuedPayload);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function removeQueuedPayload(id: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getQueuedPayloads(): Promise<QueuedPayload[]> {
  const db = await openDb();
  const result = await new Promise<QueuedPayload[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).getAll();
    request.onsuccess = () => resolve((request.result ?? []) as QueuedPayload[]);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result;
}

export async function postPayload(payload: unknown) {
  const response = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Submission failed (${response.status})`);
  }
}

export async function flushQueue(): Promise<{ synced: number; remaining: number }> {
  const queued = await getQueuedPayloads();
  let synced = 0;
  for (const item of queued) {
    try {
      await postPayload(item.payload);
      await removeQueuedPayload(item.id);
      synced += 1;
    } catch {
      // Keep the item in IndexedDB. One failed item must not destroy later field data.
    }
  }
  const remaining = (await getQueuedPayloads()).length;
  return { synced, remaining };
}
