/**
 * @fileoverview Unit tests for {@link CacheManager} — expands coverage
 * beyond the living-documentation tests in src/tests/docs/.
 *
 * @module tests/unit/utils/cache-manager
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CacheManager } from '@/utils/cache-manager';

// ── localStorage mock (same proxy approach as the docs test) ─────────────────
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
    ownKeys: (): string[] => Object.keys(store),
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

beforeEach(() => {
  (localStorageMock as any).clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  // Restore localStorageMock in case a test swapped it out via assignment
  (globalThis as any).localStorage = localStorageMock;
});

// ── setItem error handling ────────────────────────────────────────────────────

describe('CacheManager.setItem — error handling', () => {
  it('does not throw when localStorage.setItem throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Swap localStorage via simple assignment (writable: true on the property)
    (globalThis as any).localStorage = {
      getItem: (key: string): string | null => store[key] ?? null,
      setItem: () => { throw new Error('QuotaExceededError'); },
      removeItem: (key: string) => { delete store[key]; },
      get length() { return Object.keys(store).length; },
      key: (i: number): string | null => Object.keys(store)[i] ?? null,
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    };

    expect(() => CacheManager.setItem('key', 'value')).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
  });
});

// ── getItem error handling ────────────────────────────────────────────────────

describe('CacheManager.getItem — error handling', () => {
  it('returns null and logs error when stored JSON is malformed', () => {
    store['corrupt'] = '{ this is : not valid json }';
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = CacheManager.getItem<string>('corrupt');

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('returns null for a missing key without logging an error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = CacheManager.getItem<string>('nonexistent');

    expect(result).toBeNull();
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});

// ── removeItem error handling ─────────────────────────────────────────────────

describe('CacheManager.removeItem — error handling', () => {
  it('does not throw when localStorage.removeItem throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (globalThis as any).localStorage = {
      getItem: (key: string): string | null => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: () => { throw new Error('Storage unavailable'); },
      get length() { return Object.keys(store).length; },
      key: (i: number): string | null => Object.keys(store)[i] ?? null,
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    };

    expect(() => CacheManager.removeItem('key')).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
  });
});

// ── isCacheValid — boundary cases ─────────────────────────────────────────────

describe('CacheManager.isCacheValid — boundary cases', () => {
  it('returns true when entry is exactly 1 ms within the duration', () => {
    const duration = 5 * 60 * 1000;
    CacheManager.setItem('entry_timestamp', Date.now() - (duration - 1));

    expect(CacheManager.isCacheValid('entry', duration)).toBe(true);
  });

  it('returns false when entry is exactly at the duration boundary', () => {
    const duration = 5 * 60 * 1000;
    CacheManager.setItem('entry_timestamp', Date.now() - duration);

    expect(CacheManager.isCacheValid('entry', duration)).toBe(false);
  });

  it('returns false when entry is 1 ms past the duration', () => {
    const duration = 5 * 60 * 1000;
    CacheManager.setItem('entry_timestamp', Date.now() - (duration + 1));

    expect(CacheManager.isCacheValid('entry', duration)).toBe(false);
  });
});

// ── clearUserCache — all 11 patterns ─────────────────────────────────────────

describe('CacheManager.clearUserCache — full pattern coverage', () => {
  it('removes cachedProducts and its _timestamp', () => {
    CacheManager.setItem('cachedProducts', []);
    CacheManager.setItem('cachedProducts_timestamp', Date.now());
    CacheManager.clearUserCache();
    expect(CacheManager.getItem('cachedProducts')).toBeNull();
    expect(CacheManager.getItem('cachedProducts_timestamp')).toBeNull();
  });

  it('removes savedProducts keys', () => {
    CacheManager.setItem('savedProducts', [1, 2]);
    CacheManager.setItem('savedProducts_timestamp', Date.now());
    CacheManager.clearUserCache();
    expect(CacheManager.getItem('savedProducts')).toBeNull();
  });

  it('removes boughtProducts keys', () => {
    CacheManager.setItem('boughtProducts', []);
    CacheManager.setItem('boughtProducts_timestamp', Date.now());
    CacheManager.clearUserCache();
    expect(CacheManager.getItem('boughtProducts')).toBeNull();
  });

  it('removes userProfile keys', () => {
    CacheManager.setItem('userProfile', { id: 1 });
    CacheManager.setItem('userProfile_timestamp', Date.now());
    CacheManager.clearUserCache();
    expect(CacheManager.getItem('userProfile')).toBeNull();
  });

  it('removes reviewedOrders keys', () => {
    CacheManager.setItem('reviewedOrders', [1]);
    CacheManager.clearUserCache();
    expect(CacheManager.getItem('reviewedOrders')).toBeNull();
  });

  it('removes cachedPersonalOrders keys', () => {
    CacheManager.setItem('cachedPersonalOrders', []);
    CacheManager.clearUserCache();
    expect(CacheManager.getItem('cachedPersonalOrders')).toBeNull();
  });

  it('removes cachedFAQs keys', () => {
    CacheManager.setItem('cachedFAQs', []);
    CacheManager.setItem('cachedFAQs_timestamp', Date.now());
    CacheManager.clearUserCache();
    expect(CacheManager.getItem('cachedFAQs')).toBeNull();
  });

  it('removes reviewedProducts keys', () => {
    CacheManager.setItem('reviewedProducts', [1, 2]);
    CacheManager.clearUserCache();
    expect(CacheManager.getItem('reviewedProducts')).toBeNull();
  });

  it('removes pollsCache keys', () => {
    CacheManager.setItem('pollsCache', {});
    CacheManager.clearUserCache();
    expect(CacheManager.getItem('pollsCache')).toBeNull();
  });

  it('removes the authToken', () => {
    CacheManager.setItem('authToken', 'jwt-token-abc');
    CacheManager.clearUserCache();
    expect(CacheManager.getItem('authToken')).toBeNull();
  });

  it('removes all _timestamp keys regardless of prefix', () => {
    CacheManager.setItem('someData_timestamp', Date.now());
    CacheManager.setItem('anotherKey_timestamp', Date.now());
    CacheManager.clearUserCache();
    expect(CacheManager.getItem('someData_timestamp')).toBeNull();
    expect(CacheManager.getItem('anotherKey_timestamp')).toBeNull();
  });

  it('preserves unrelated application keys like appTheme and language', () => {
    CacheManager.setItem('appTheme', 'dark');
    CacheManager.setItem('language', 'uk');
    CacheManager.setItem('authToken', 'jwt');
    CacheManager.clearUserCache();
    expect(CacheManager.getItem('appTheme')).toBe('dark');
    expect(CacheManager.getItem('language')).toBe('uk');
  });

  it('handles an empty localStorage without throwing', () => {
    expect(() => CacheManager.clearUserCache()).not.toThrow();
  });

  it('handles keys that partially match a pattern but are not in the purge list', () => {
    CacheManager.setItem('notCachedProducts', 'should-stay');
    CacheManager.clearUserCache();
    expect(CacheManager.getItem('notCachedProducts')).toBe('should-stay');
  });
});

// ── setWithTimestamp ──────────────────────────────────────────────────────────

describe('CacheManager.setWithTimestamp', () => {
  it('stores the value and a _timestamp key together', () => {
    const data = [{ id: 1 }];
    CacheManager.setWithTimestamp('myKey', data);

    expect(CacheManager.getItem('myKey')).toEqual(data);
    expect(CacheManager.isCacheValid('myKey', 60_000)).toBe(true);
  });

  it('overwrites an existing entry and resets its timestamp', () => {
    CacheManager.setItem('myKey_timestamp', Date.now() - 10 * 60 * 1000);
    CacheManager.setWithTimestamp('myKey', 'fresh');

    expect(CacheManager.isCacheValid('myKey', 5 * 60 * 1000)).toBe(true);
  });
});
