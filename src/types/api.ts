/**
 * @fileoverview API-level types: generic response envelopes and typed errors.
 * @module types/api
 */

/**
 * Typed error thrown by {@link ApiService} when the backend returns a
 * non-2xx HTTP status. Extends the native `Error` so existing callers
 * using `error instanceof Error` continue to work without modification.
 *
 * @example
 * ```ts
 * try {
 *   await apiService.getPolls();
 * } catch (err) {
 *   if (err instanceof ApiError && err.status === 401) { // redirect to login }
 * }
 * ```
 */
export class ApiError extends Error {
  /** HTTP status code returned by the server (e.g. 401, 403, 404, 409). */
  readonly status: number;
  /** Optional machine-readable error code from the response body. */
  readonly code?: string;

  /**
   * @param message - Human-readable description forwarded from `data.error`.
   * @param status  - HTTP status code from `response.status`.
   * @param code    - Optional structured error code from the response body.
   */
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Standard JSON envelope returned by every MuzaLife backend endpoint.
 *
 * @template T - Shape of the `data` payload. Defaults to `unknown` to force
 *   callers to narrow the type rather than silently accepting untyped values.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
