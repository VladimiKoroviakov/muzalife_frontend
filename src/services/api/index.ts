/**
 * @fileoverview Centralised HTTP API client for the MuzaLife frontend.
 *
 * All communication with the MuzaLife backend goes through the `apiService`
 * singleton exported from this module.  Import it with:
 *
 * ```ts
 * import { apiService } from '@/services/api';
 * ```
 *
 * **Architecture:**
 * - `ApiClient` (internal) owns the JWT, fetch wrapper, and cache utilities.
 * - Domain modules (`auth`, `profile`, `products`, `orders`, `faqs`, `polls`,
 *   `reviews`) export factory functions that receive the client and return
 *   typed method objects.
 * - This file instantiates the client, calls each factory, and merges the
 *   results into the single `apiService` object.
 *
 * **Auth flow:** after a successful login / OAuth callback the JWT is
 * persisted automatically inside `ApiClient.authRequest`.  On logout /
 * account deletion `ApiClient.clearUserData` purges the token and all
 * user-scoped cache entries.
 *
 * @module services/api
 */

import { ApiClient } from './client';
import { createAuthMethods } from './auth';
import { createProfileMethods } from './profile';
import { createProductsMethods } from './products';
import { createOrdersMethods } from './orders';
import { createFaqsMethods } from './faqs';
import { createPollsMethods } from './polls';
import { createReviewsMethods } from './reviews';
import { createAdminMethods } from './admin';
import { createPaymentsMethods } from './payments';

const client = new ApiClient();

/**
 * Singleton API service exposing all backend communication methods.
 *
 * Do not instantiate — import this directly:
 * ```ts
 * import { apiService } from '@/services/api';
 * ```
 */
export const apiService = {
  ...createAuthMethods(client),
  ...createProfileMethods(client),
  ...createProductsMethods(client),
  ...createOrdersMethods(client),
  ...createFaqsMethods(client),
  ...createPollsMethods(client),
  ...createReviewsMethods(client),
  ...createAdminMethods(client),
  ...createPaymentsMethods(client),

  // Cache utilities forwarded from the client
  clearUserData: () => client.clearUserData(),
  clearProductsCache: () => client.clearProductsCache(),
  clearAllCache: () => client.clearAllCache(),
};
