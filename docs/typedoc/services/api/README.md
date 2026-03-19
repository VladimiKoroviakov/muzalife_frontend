[**MuzaLife Frontend v0.1.0**](../../README.md)

***

[MuzaLife Frontend](../../modules.md) / services/api

# services/api

## Fileoverview

Centralised HTTP API client for the MuzaLife frontend.

Provides a typed, opinionated wrapper around the browser `fetch` API.
All communication with the MuzaLife backend goes through the
ApiService class exported as a singleton (`apiService`).

**Architecture decisions:**
- All requests are authenticated with a JWT stored in `localStorage`
  under the key `'authToken'`.  The token is injected automatically via
  the `Authorization: Bearer` header for every request.
- Responses are eagerly parsed as JSON.  A non-OK HTTP status is turned
  into a thrown `Error` carrying the server's `error` field.
- The [CacheManager](../../utils/CacheManager/classes/CacheManager.md) is used to cache hot data (products, FAQs,
  polls) so the UI remains responsive between navigations.

**Interaction with auth:** after a successful login / OAuth callback the
returned JWT is written to `localStorage` via ApiService.setToken.
On logout ApiService.clearUserData purges the token and all user
cache entries.

## Variables

- [apiService](variables/apiService.md)
