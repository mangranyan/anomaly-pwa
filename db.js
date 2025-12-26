// https://cdn.jsdelivr.net/npm/idb@8/+esm
const DB_NAME = 'AbnormalReportDB';

export const openDB = async () => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
};

export const saveDraft = async (draft) => {
  const db = await openDB();
  const tx = db.transaction('drafts', 'readwrite');
  draft.id = 'current';
  draft.timestamp = new Date().toISOString();
  tx.objectStore('drafts').put(draft);
  await tx.done;
};

export const getDraft = async () => {
  const db = await openDB();
  const tx = db.transaction('drafts', 'readonly');
  const draft = await tx.objectStore('drafts').get('current');
  await tx.done;
  return draft;
};

export const deleteDraft = async () => {
  const db = await openDB();
  const tx = db.transaction('drafts', 'readwrite');
  tx.objectStore('drafts').delete('current');
  await tx.done;
};

export const saveConfig = async (config) => {
  const db = await openDB();
  const tx = db.transaction('config', 'readwrite');
  await tx.objectStore('config').put({ key: 'mqtt', ...config });
  await tx.done;
};

export const getConfig = async () => {
  const db = await openDB();
  const tx = db.transaction('config', 'readonly');
  const config = await tx.objectStore('config').get('mqtt');
  await tx.done;
  return config;
};