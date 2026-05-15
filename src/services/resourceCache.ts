type CacheRecord<T> = {
  value: T;
  storedAt: number; // epoch ms
};

type MemoryEntry<T> = {
  value?: T;
  storedAt?: number;
  inFlight?: Promise<T>;
};

const memory = new Map<string, MemoryEntry<any>>();

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export type CacheOptions = {
  /** TTL in ms (defaults to 10 minutes) */
  ttlMs?: number;
  /** Optional localStorage key to persist cache across reloads */
  storageKey?: string;
};

const DEFAULT_TTL_MS = 10 * 60 * 1000;

export function readCachedValue<T>(key: string, opts: CacheOptions = {}): T | null {
  const ttlMs = opts.ttlMs ?? DEFAULT_TTL_MS;

  const m = memory.get(key) as MemoryEntry<T> | undefined;
  if (m?.value !== undefined && (m.storedAt ?? 0) + ttlMs > Date.now()) {
    return m.value;
  }

  if (opts.storageKey) {
    const rec = safeParseJson<CacheRecord<T>>(localStorage.getItem(opts.storageKey));
    if (rec && rec.storedAt + ttlMs > Date.now()) {
      memory.set(key, { value: rec.value, storedAt: rec.storedAt });
      return rec.value;
    }
  }

  return null;
}

/** Read cached value ignoring TTL — returns stale data if present */
export function readCachedValueStale<T>(key: string, opts: CacheOptions = {}): T | null {
  const m = memory.get(key) as MemoryEntry<T> | undefined;
  if (m?.value !== undefined) return m.value;

  if (opts.storageKey) {
    const rec = safeParseJson<CacheRecord<T>>(localStorage.getItem(opts.storageKey));
    if (rec) {
      memory.set(key, { value: rec.value, storedAt: rec.storedAt });
      return rec.value;
    }
  }

  return null;
}

export function writeCachedValue<T>(key: string, value: T, opts: CacheOptions = {}): void {
  const storedAt = Date.now();
  memory.set(key, { value, storedAt });
  if (opts.storageKey) {
    try {
      const rec: CacheRecord<T> = { value, storedAt };
      localStorage.setItem(opts.storageKey, JSON.stringify(rec));
    } catch {
      // ignore quota / private mode
    }
  }
}

export async function getOrFetchCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts: CacheOptions = {}
): Promise<T> {
  const ttlMs = opts.ttlMs ?? DEFAULT_TTL_MS;
  const now = Date.now();

  const m = memory.get(key) as MemoryEntry<T> | undefined;
  if (m?.value !== undefined && (m.storedAt ?? 0) + ttlMs > now) {
    return m.value;
  }
  if (m?.inFlight) return m.inFlight;

  const inFlight = fetcher()
    .then((value) => {
      writeCachedValue(key, value, opts);
      const cur = memory.get(key) as MemoryEntry<T> | undefined;
      if (cur) {
        cur.inFlight = undefined;
        memory.set(key, cur);
      }
      return value;
    })
    .catch((e) => {
      const cur = memory.get(key) as MemoryEntry<T> | undefined;
      if (cur) {
        cur.inFlight = undefined;
        memory.set(key, cur);
      }
      throw e;
    });

  memory.set(key, { ...(m || {}), inFlight });
  return inFlight;
}


