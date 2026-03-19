[**MuzaLife Frontend v0.1.0**](../../README.md)

***

[MuzaLife Frontend](../../modules.md) / utils/CacheManager

# utils/CacheManager

## Fileoverview

`localStorage`-based cache manager with timestamp validation.

Provides a typed, error-safe wrapper around `localStorage` for caching API
responses on the client.  Timestamps are stored alongside values so callers
can check whether cached data is still fresh before issuing a network request.

**Architecture decision:** using `localStorage` (not `sessionStorage` or
in-memory cache) so that data survives page reloads.  On sign-out all
user-specific cache keys are purged via [CacheManager.clearUserCache](classes/CacheManager.md#clearusercache).

**Business-logic note:** the module intentionally swallows errors from
`JSON.parse` / `localStorage` operations so that a full storage quota or
a corrupt entry never crashes the application.

## Classes

- [CacheManager](classes/CacheManager.md)
