import { openDB } from 'idb';

interface AnomalyDraft {
  id: string;
  timestamp: string;
  formData: Record<string, any>;
}

interface MqttConfig {
  host: string;
  username: string;
  password: string;
  clientId: string;
  topic: string;
}

const DB_NAME = 'AnomalyPWA';
const STORE_DRAFTS = 'drafts';
const STORE_CONFIG = 'config';

export const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
      db.createObjectStore(STORE_DRAFTS, { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains(STORE_CONFIG)) {
      db.createObjectStore(STORE_CONFIG, { keyPath: 'key' });
    }
  }
});

// Draft 相关
export async function saveDraft(formData: Record<string, any>) {
  const id = crypto.randomUUID();
  await (await dbPromise).put(STORE_DRAFTS, {
    id,
    timestamp: new Date().toISOString(),
    formData
  });
  return id;
}

export async function getLatestDraft(): Promise<AnomalyDraft | null> {
  const drafts = await (await dbPromise).getAll(STORE_DRAFTS);
  return drafts.length > 0 ? drafts[0] : null;
}

export async function clearDraft() {
  const keys = await (await dbPromise).getAllKeys(STORE_DRAFTS);
  for (const key of keys) {
    await (await dbPromise).delete(STORE_DRAFTS, key);
  }
}

// MQTT Config 相关
export async function saveMqttConfig(config: MqttConfig) {
  await (await dbPromise).put(STORE_CONFIG, { key: 'mqtt', ...config });
}

export async function loadMqttConfig(): Promise<MqttConfig | null> {
  const record = await (await dbPromise).get(STORE_CONFIG, 'mqtt');
  return record ? {
    host: record.host,
    username: record.username,
    password: record.password,
    clientId: record.clientId,
    topic: record.topic
  } : null;
}