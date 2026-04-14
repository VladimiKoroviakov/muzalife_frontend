/**
 * @fileoverview Core HTTP transport client for the MuzaLife API.
 *
 * `ApiClient` is an internal implementation detail — it is never exported
 * from the `services/api` barrel.  Domain modules receive an instance via
 * their factory-function parameter and call its public methods.
 *
 * Responsibilities:
 * - JWT lifecycle (`token` getter, `setToken`, `clearUserData`)
 * - Fetch wrapper with auth headers and typed error handling
 * - Auth-specific `authRequest` that persists the returned JWT
 * - Shared array-cache helpers used by the products domain
 * - Cache-clearing utilities forwarded onto `apiService`
 *
 * @module services/api/client
 */

import config from '../../config';
import { CacheManager } from '../../utils/cache-manager';
import { ApiError, AuthResponse } from '../../types';

/**
 * Internal HTTP transport shared by all domain modules.
 *
 * Only `src/services/api/index.ts` should instantiate this class.
 * All other files receive it as a parameter.
 */
export class ApiClient {
  private _token: string | null;

  constructor() {
    this._token = localStorage.getItem('authToken');
  }

  /** Current JWT, readable by domain modules that bypass the `request` helper (e.g. multipart uploads). */
  get token(): string | null {
    return this._token;
  }

  private setToken(token: string | null): void {
    this._token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    body?: object,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${config.apiUrl}${endpoint}`;
    const headers = {
      ...config.defaultHeaders,
      ...(this._token && { 'Authorization': `Bearer ${this._token}` }),
      ...customHeaders,
    };

    const requestConfig: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    };

    const response = await fetch(url, requestConfig);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error || 'Request failed', response.status);
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'GET');
  }

  async post<T>(endpoint: string, body: object): Promise<T> {
    return this.request<T>(endpoint, 'POST', body);
  }

  /**
   * Like `post`, but overrides the Authorization header with a caller-supplied
   * token.  Used by the guest checkout flow to pass a short-lived guest JWT
   * instead of the stored user token.
   *
   * @param endpoint  - API endpoint path.
   * @param body      - Request payload.
   * @param authToken - Token to use as `Authorization: Bearer <token>`.
   * @returns Typed response.
   */
  async postWithCustomAuth<T>(endpoint: string, body: object, authToken: string): Promise<T> {
    return this.request<T>(endpoint, 'POST', body, { 'Authorization': `Bearer ${authToken}` });
  }

  async put<T>(endpoint: string, body: object): Promise<T> {
    return this.request<T>(endpoint, 'PUT', body);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'DELETE');
  }

  /**
   * Like `post`, but also persists the JWT from the response body.
   * Used exclusively by auth endpoints that return a `token` field.
   *
   * @param endpoint - API endpoint path.
   * @param body     - Request payload.
   * @returns Typed response from the auth endpoint.
   */
  async authRequest<T = AuthResponse>(endpoint: string, body: object): Promise<T> {
    const result = await this.post<T>(endpoint, body);

    if (result && typeof result === 'object' && 'token' in result) {
      const token = (result as Record<string, unknown>).token;
      if (typeof token === 'string') {
        this.setToken(token);
      }
    }

    return result;
  }

  /**
   * Retrieves a cached array from localStorage, or `null` if absent.
   *
   * @param key - Cache key.
   * @returns The cached array or `null`.
   */
  getCachedArray<T>(key: string): T[] | null {
    return CacheManager.getItem<T[]>(key);
  }

  /**
   * Adds or removes a single item from a cached array and writes the result back.
   *
   * @param key        - Cache key.
   * @param item       - Item to add or remove.
   * @param operation  - `'add'` or `'remove'`.
   * @param comparator - Optional equality function; defaults to `===`.
   */
  updateCachedArray<T>(
    key: string,
    item: T,
    operation: 'add' | 'remove',
    comparator: (a: T, b: T) => boolean = (a, b) => a === b
  ): void {
    const current = this.getCachedArray<T>(key) || [];
    let updated: T[];

    if (operation === 'add') {
      updated = current.some((existing) => comparator(existing, item))
        ? current
        : [...current, item];
    } else {
      updated = current.filter((existing) => !comparator(existing, item));
    }

    CacheManager.setItem(key, updated);
  }

  /** Clears the JWT and all user-scoped cache entries. Called on logout / account deletion. */
  clearUserData(): void {
    CacheManager.clearUserCache();
    this.setToken(null);
  }

  /** Removes cached product data so the next fetch retrieves fresh results. */
  clearProductsCache(): void {
    CacheManager.removeItem(config.cacheKeys.PRODUCTS);
    CacheManager.removeItem(config.cacheKeys.PRODUCTS_TIMESTAMP);
  }

  /** Alias for {@link clearUserData} that also clears non-user caches if any are added in future. */
  clearAllCache(): void {
    CacheManager.clearUserCache();
  }
}
