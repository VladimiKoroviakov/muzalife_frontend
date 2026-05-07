/**
 * @fileoverview Unit tests for {@link ApiClient}.
 *
 * @module tests/unit/services/client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '@/services/api/client';
import { ApiError } from '@/types';

vi.mock('@/utils/cache-manager', () => ({
  CacheManager: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    isCacheValid: vi.fn(),
    setWithTimestamp: vi.fn(),
    clearUserCache: vi.fn(),
  },
}));

import { CacheManager } from '@/utils/cache-manager';
const mockCacheManager = vi.mocked(CacheManager, true);

// ── localStorage mock ─────────────────────────────────────────────────────────
const store: Record<string, string> = {};
const localStorageMock = new Proxy(
  {
    getItem:    (key: string): string | null => store[key] ?? null,
    setItem:    (key: string, value: string): void => { store[key] = value; },
    removeItem: (key: string): void => { delete store[key]; },
    get length(): number { return Object.keys(store).length; },
    key:        (i: number): string | null => Object.keys(store)[i] ?? null,
    clear:      (): void => { Object.keys(store).forEach((k) => delete store[k]); },
  },
  {
    ownKeys: () => Object.keys(store),
    getOwnPropertyDescriptor: (_t: object, k: string | symbol) => {
      if (Object.prototype.hasOwnProperty.call(store, k)) {
        return { enumerable: true, configurable: true, value: store[k as string] };
      }
      return undefined;
    },
  }
);

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ── fetch mock ────────────────────────────────────────────────────────────────
const mockFetch = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  (localStorageMock as any).clear();
  vi.stubGlobal('fetch', mockFetch);
});

// ── Constructor ───────────────────────────────────────────────────────────────

describe('constructor', () => {
  it('reads authToken from localStorage and exposes it via token getter', () => {
    store['authToken'] = 'stored-jwt';
    const client = new ApiClient();
    expect(client.token).toBe('stored-jwt');
  });

  it('initialises token to null when localStorage has no authToken', () => {
    const client = new ApiClient();
    expect(client.token).toBeNull();
  });
});

// ── HTTP methods ──────────────────────────────────────────────────────────────

describe('get', () => {
  it('calls fetch with GET method and correct URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'result' }),
    });

    const client = new ApiClient();
    const result = await client.get('/test-endpoint');

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/test-endpoint');
    expect(options.method).toBe('GET');
    expect(result).toEqual({ data: 'result' });
  });

  it('includes Authorization header when token is set', async () => {
    store['authToken'] = 'user-jwt';
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const client = new ApiClient();
    await client.get('/endpoint');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Authorization']).toBe('Bearer user-jwt');
  });

  it('omits Authorization header when no token', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const client = new ApiClient();
    await client.get('/endpoint');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Authorization']).toBeUndefined();
  });

  it('throws ApiError when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    });

    const client = new ApiClient();
    await expect(client.get('/missing')).rejects.toBeInstanceOf(ApiError);
  });

  it('throws ApiError with fallback message when response has no error field', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    const client = new ApiClient();
    await expect(client.get('/endpoint')).rejects.toThrow('Request failed');
  });
});

describe('post', () => {
  it('calls fetch with POST method and serialized body', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });

    const client = new ApiClient();
    await client.post('/endpoint', { key: 'value' });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.body).toBe(JSON.stringify({ key: 'value' }));
  });
});

describe('put', () => {
  it('calls fetch with PUT method and body', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const client = new ApiClient();
    await client.put('/endpoint', { name: 'updated' });

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('PUT');
  });
});

describe('delete', () => {
  it('calls fetch with DELETE method and no body', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const client = new ApiClient();
    await client.delete('/endpoint');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('DELETE');
    expect(options.body).toBeUndefined();
  });
});

describe('postWithCustomAuth', () => {
  it('overrides Authorization header with the provided token', async () => {
    store['authToken'] = 'regular-jwt';
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    const client = new ApiClient();
    await client.postWithCustomAuth('/endpoint', { data: 1 }, 'custom-jwt');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers['Authorization']).toBe('Bearer custom-jwt');
  });
});

// ── authRequest ───────────────────────────────────────────────────────────────

describe('authRequest', () => {
  it('persists the JWT returned in the response via localStorage', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'new-jwt', user: { id: 1 } }),
    });

    const client = new ApiClient();
    await client.authRequest('/auth/login', { email: 'a@b.com', password: 'pass' });

    expect(client.token).toBe('new-jwt');
    expect(store['authToken']).toBe('new-jwt');
  });

  it('does not update localStorage when response has no token', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { id: 1 } }),
    });

    const client = new ApiClient();
    await client.authRequest('/auth/refresh', {});

    expect(client.token).toBeNull();
    expect(store['authToken']).toBeUndefined();
  });

  it('does not update token when response.token is not a string', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 12345 }),
    });

    const client = new ApiClient();
    await client.authRequest('/auth/login', {});

    expect(client.token).toBeNull();
  });

  it('returns the full response object', async () => {
    const payload = { token: 'jwt', user: { id: 1, name: 'Alice' } };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const client = new ApiClient();
    const result = await client.authRequest('/auth/login', {});

    expect(result).toEqual(payload);
  });
});

// ── Cache helpers ─────────────────────────────────────────────────────────────

describe('getCachedArray', () => {
  it('delegates to CacheManager.getItem', () => {
    mockCacheManager.getItem.mockReturnValue([1, 2, 3]);

    const client = new ApiClient();
    const result = client.getCachedArray<number>('savedProducts');

    expect(mockCacheManager.getItem).toHaveBeenCalledWith('savedProducts');
    expect(result).toEqual([1, 2, 3]);
  });

  it('returns null when cache is empty', () => {
    mockCacheManager.getItem.mockReturnValue(null);

    const client = new ApiClient();
    expect(client.getCachedArray('key')).toBeNull();
  });
});

describe('updateCachedArray — add', () => {
  it('appends a new item when it does not exist in the cache', () => {
    mockCacheManager.getItem.mockReturnValue([1, 2]);

    const client = new ApiClient();
    client.updateCachedArray<number>('key', 3, 'add');

    expect(mockCacheManager.setItem).toHaveBeenCalledWith('key', [1, 2, 3]);
  });

  it('does not duplicate an item that already exists', () => {
    mockCacheManager.getItem.mockReturnValue([1, 2, 3]);

    const client = new ApiClient();
    client.updateCachedArray<number>('key', 2, 'add');

    expect(mockCacheManager.setItem).toHaveBeenCalledWith('key', [1, 2, 3]);
  });

  it('initialises from empty array when cache is null', () => {
    mockCacheManager.getItem.mockReturnValue(null);

    const client = new ApiClient();
    client.updateCachedArray<number>('key', 5, 'add');

    expect(mockCacheManager.setItem).toHaveBeenCalledWith('key', [5]);
  });

  it('uses a custom comparator for equality', () => {
    const items = [{ id: 1 }, { id: 2 }];
    mockCacheManager.getItem.mockReturnValue(items);

    const client = new ApiClient();
    client.updateCachedArray<{ id: number }>('key', { id: 2 }, 'add', (a, b) => a.id === b.id);

    expect(mockCacheManager.setItem).toHaveBeenCalledWith('key', items);
  });
});

describe('updateCachedArray — remove', () => {
  it('removes an existing item from the cache', () => {
    mockCacheManager.getItem.mockReturnValue([1, 2, 3]);

    const client = new ApiClient();
    client.updateCachedArray<number>('key', 2, 'remove');

    expect(mockCacheManager.setItem).toHaveBeenCalledWith('key', [1, 3]);
  });

  it('leaves the array unchanged when item is not present', () => {
    mockCacheManager.getItem.mockReturnValue([1, 3]);

    const client = new ApiClient();
    client.updateCachedArray<number>('key', 99, 'remove');

    expect(mockCacheManager.setItem).toHaveBeenCalledWith('key', [1, 3]);
  });

  it('uses a custom comparator when removing', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
    mockCacheManager.getItem.mockReturnValue(items);

    const client = new ApiClient();
    client.updateCachedArray<{ id: number }>('key', { id: 2 }, 'remove', (a, b) => a.id === b.id);

    expect(mockCacheManager.setItem).toHaveBeenCalledWith('key', [{ id: 1 }, { id: 3 }]);
  });
});

// ── Clear helpers ─────────────────────────────────────────────────────────────

describe('clearUserData', () => {
  it('calls CacheManager.clearUserCache and removes the JWT token', async () => {
    store['authToken'] = 'existing-jwt';
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'existing-jwt' }),
    });

    const client = new ApiClient();
    client.clearUserData();

    expect(mockCacheManager.clearUserCache).toHaveBeenCalledOnce();
    expect(client.token).toBeNull();
    expect(store['authToken']).toBeUndefined();
  });
});

describe('clearProductsCache', () => {
  it('removes products and products_timestamp from cache', () => {
    const client = new ApiClient();
    client.clearProductsCache();

    expect(mockCacheManager.removeItem).toHaveBeenCalledTimes(2);
  });
});

describe('clearAllCache', () => {
  it('calls CacheManager.clearUserCache', () => {
    const client = new ApiClient();
    client.clearAllCache();

    expect(mockCacheManager.clearUserCache).toHaveBeenCalledOnce();
  });
});
