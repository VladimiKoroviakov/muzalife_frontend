/**
 * @fileoverview Living documentation for {@link CacheManager}.
 *
 * Every `it()` block is a specification of one observable behaviour.
 * The suite uses a `localStorage` mock so tests run in Node (no browser
 * required) and remain deterministic regardless of storage state.
 *
 * @module tests/docs/cache-manager.docs
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheManager } from '../../utils/cache-manager';

// ── Minimal localStorage mock ─────────────────────────────────────────────
// Backed by a plain `store` record.  The outer Proxy makes `Object.keys()`
// return the store's *data* keys (not the mock's method names), which is
// required for `CacheManager.clearUserCache()` to work correctly in tests.
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
    // `Object.keys(localStorage)` in clearUserCache() must see store keys.
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

beforeEach(() => (localStorageMock as any).clear());

// ─────────────────────────────────────────────────────────────────────────────
// setItem / getItem  — basic round-trip
// ─────────────────────────────────────────────────────────────────────────────
describe('CacheManager.setItem / getItem', () => {
  it('stores a primitive value and retrieves it', () => {
    CacheManager.setItem('score', 100);
    expect(CacheManager.getItem<number>('score')).toBe(100);
  });

  it('stores an object and retrieves it with full type fidelity', () => {
    const user = { id: 1, name: 'Alice', role: 'admin' };
    CacheManager.setItem('user', user);
    expect(CacheManager.getItem<typeof user>('user')).toEqual(user);
  });

  it('returns null for a key that has never been set', () => {
    expect(CacheManager.getItem('nonexistent')).toBeNull();
  });

  it('returns null and does not throw when stored JSON is corrupt', () => {
    store['bad'] = '{not: valid json}'; // inject corrupt data manually
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => CacheManager.getItem('bad')).not.toThrow();
    expect(CacheManager.getItem('bad')).toBeNull();
    expect(spy).toHaveBeenCalledTimes(2); // once per getItem call
    vi.restoreAllMocks();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// removeItem
// ─────────────────────────────────────────────────────────────────────────────
describe('CacheManager.removeItem', () => {
  it('deletes an existing entry so getItem returns null afterwards', () => {
    CacheManager.setItem('temp', 'value');
    CacheManager.removeItem('temp');
    expect(CacheManager.getItem('temp')).toBeNull();
  });

  it('does not throw when removing a key that does not exist', () => {
    expect(() => CacheManager.removeItem('ghost')).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setWithTimestamp / isCacheValid  — freshness semantics
// ─────────────────────────────────────────────────────────────────────────────
describe('CacheManager.setWithTimestamp / isCacheValid', () => {
  it('cache is considered valid immediately after setWithTimestamp', () => {
    CacheManager.setWithTimestamp('products', [{ id: 1 }]);
    expect(CacheManager.isCacheValid('products', 5 * 60 * 1000)).toBe(true);
  });

  it('cache is considered stale after the duration has elapsed', () => {
    // Set a timestamp 10 minutes in the past
    CacheManager.setItem('old_timestamp', Date.now() - 10 * 60 * 1000);
    expect(CacheManager.isCacheValid('old', 5 * 60 * 1000)).toBe(false);
  });

  it('isCacheValid returns false when no timestamp entry exists', () => {
    expect(CacheManager.isCacheValid('missing', 60_000)).toBe(false);
  });

  it('stores both the data and a companion _timestamp entry', () => {
    CacheManager.setWithTimestamp('faqs', []);
    expect(store['faqs']).toBeDefined();
    expect(store['faqs_timestamp']).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// clearUserCache  — sign-out purge behaviour
// ─────────────────────────────────────────────────────────────────────────────
describe('CacheManager.clearUserCache', () => {
  it('removes all known user-related cache keys on sign-out', () => {
    const userKeys = [
      'cachedProducts',
      'savedProducts',
      'boughtProducts',
      'userProfile',
      'cachedFAQs',
      'pollsCache',
      'authToken',
    ];
    userKeys.forEach((k) => CacheManager.setItem(k, 'value'));

    CacheManager.clearUserCache();

    userKeys.forEach((k) => {
      expect(CacheManager.getItem(k)).toBeNull();
    });
  });

  it('removes _timestamp companion keys', () => {
    CacheManager.setWithTimestamp('cachedProducts', []);
    // Both cachedProducts and cachedProducts_timestamp should be gone
    CacheManager.clearUserCache();
    expect(store['cachedProducts_timestamp']).toBeUndefined();
  });

  it('preserves unrelated keys that do not match any user-cache pattern', () => {
    CacheManager.setItem('appTheme', 'dark');
    CacheManager.clearUserCache();
    expect(CacheManager.getItem('appTheme')).toBe('dark');
  });
});
