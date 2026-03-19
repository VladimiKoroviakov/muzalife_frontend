/**
 * @fileoverview `localStorage`-based cache manager with timestamp validation.
 *
 * Provides a typed, error-safe wrapper around `localStorage` for caching API
 * responses on the client.  Timestamps are stored alongside values so callers
 * can check whether cached data is still fresh before issuing a network request.
 *
 * **Architecture decision:** using `localStorage` (not `sessionStorage` or
 * in-memory cache) so that data survives page reloads.  On sign-out all
 * user-specific cache keys are purged via {@link CacheManager.clearUserCache}.
 *
 * **Business-logic note:** the module intentionally swallows errors from
 * `JSON.parse` / `localStorage` operations so that a full storage quota or
 * a corrupt entry never crashes the application.
 *
 * @module utils/CacheManager
 */

/**
 * Static utility class for `localStorage`-backed data caching.
 *
 * All methods are static — no instance is needed.
 *
 * @example
 * // Store and retrieve products
 * CacheManager.setWithTimestamp('cachedProducts', products);
 *
 * if (CacheManager.isCacheValid('cachedProducts', 5 * 60 * 1000)) {
 *   return CacheManager.getItem<Product[]>('cachedProducts');
 * }
 */
export class CacheManager {
  /**
   * Serialises `value` to JSON and writes it to `localStorage` under `key`.
   *
   * Silently swallows storage errors (e.g. quota exceeded, private browsing).
   *
   * @typeParam T   - The type of the value being stored.
   * @param key     - The `localStorage` key.
   * @param value   - The value to cache; must be JSON-serialisable.
   *
   * @example
   * CacheManager.setItem('userProfile', { id: 1, name: 'Alice' });
   */
  static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error caching ${key}:`, error);
    }
  }

  /**
   * Reads and deserialises the value stored under `key`.
   *
   * Returns `null` if the key is absent or the stored JSON is corrupt.
   *
   * @typeParam T - The expected type of the cached value.
   * @param key   - The `localStorage` key to read.
   * @returns The deserialised value, or `null` on miss / error.
   *
   * @example
   * const profile = CacheManager.getItem<UserProfile>('userProfile');
   * if (profile) { ... }
   */
  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  }

  /**
   * Removes the entry stored under `key` from `localStorage`.
   *
   * @param key - The `localStorage` key to remove.
   *
   * @example
   * CacheManager.removeItem('userProfile');
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }

  /**
   * Stores `value` under `key` and records the current timestamp under
   * `<key>_timestamp` so that freshness can be checked later with
   * {@link isCacheValid}.
   *
   * @param key   - The `localStorage` key for the data.
   * @param value - The value to cache.
   *
   * @example
   * CacheManager.setWithTimestamp('cachedFAQs', faqs);
   */
  static setWithTimestamp(key: string, value: any): void {
    this.setItem(key, value);
    this.setItem(`${key}_timestamp`, Date.now());
  }

  /**
   * Returns `true` if the cached entry under `key` was written within the
   * last `duration` milliseconds.
   *
   * **Algorithm:** reads `<key>_timestamp` (set by {@link setWithTimestamp})
   * and compares it to `Date.now()`.
   *
   * @param key      - The cache key (without the `_timestamp` suffix).
   * @param duration - Maximum age in milliseconds before the cache is
   *                   considered stale (e.g. `5 * 60 * 1000` for 5 minutes).
   * @returns `true` if the entry exists and is still within `duration`; `false` otherwise.
   *
   * @example
   * if (CacheManager.isCacheValid('cachedProducts', 5 * 60 * 1000)) {
   *   return CacheManager.getItem<Product[]>('cachedProducts');
   * }
   */
  static isCacheValid(key: string, duration: number): boolean {
    const timestamp = this.getItem<number>(`${key}_timestamp`);
    if (!timestamp) {return false;}
    return Date.now() - timestamp < duration;
  }

  /**
   * Removes all user-specific cache entries from `localStorage`.
   *
   * Called on sign-out to prevent stale data from being displayed to the
   * next user that logs in on the same browser.
   *
   * **Purged patterns:** `cachedProducts*`, `savedProducts*`, `boughtProducts*`,
   * `userProfile*`, `reviewedOrders*`, `cachedPersonalOrders*`, `cachedFAQs*`,
   * `reviewedProducts*`, `pollsCache*`, `*_timestamp`, `authToken`.
   *
   * @example
   * // Called automatically by useAuth on sign-out
   * CacheManager.clearUserCache();
   */
  static clearUserCache(): void {
    const cachePatterns = [
      /^cachedProducts/,
      /^savedProducts/,
      /^boughtProducts/,
      /^userProfile/,
      /^reviewedOrders/,
      /^cachedPersonalOrders/,
      /^cachedFAQs/,
      /^reviewedProducts/,
      /^pollsCache/,
      /_timestamp$/,
      'authToken',
    ];

    Object.keys(localStorage).forEach((key) => {
      if (cachePatterns.some((pattern) =>
        typeof pattern === 'string' ? key === pattern : pattern.test(key)
      )) {
        localStorage.removeItem(key);
      }
    });
  }
}
