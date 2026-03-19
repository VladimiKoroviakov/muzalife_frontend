[**MuzaLife Frontend v0.1.0**](../../README.md)

***

[MuzaLife Frontend](../../modules.md) / hooks/useAuth

# hooks/useAuth

## Fileoverview

Core authentication hook for MuzaLife Frontend.

Contains the main stateful logic for managing authentication in the
application.  It is consumed by AuthProvider and exposed
application-wide through useAuthContext.

**State management:** a single `authState` object holds `user`,
`isLoading`, and `error`.  All mutation functions derive from
`apiService` calls and update this state atomically.

**Duplicate-request prevention:** two refs (`authCheckInProgress`,
`authCheckCalled`) ensure `checkAuth` is never called twice on mount,
which would double-count network requests in React StrictMode.

## Functions

- [useAuth](functions/useAuth.md)
