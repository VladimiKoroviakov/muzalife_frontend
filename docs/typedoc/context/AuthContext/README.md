[**MuzaLife Frontend v0.1.0**](../../README.md)

***

[MuzaLife Frontend](../../modules.md) / context/AuthContext

# context/AuthContext

## Fileoverview

Authentication React Context.

Provides application-wide access to authentication state and actions via
React Context.  The context is backed by the [useAuth](../../hooks/useAuth/functions/useAuth.md) hook which
manages the JWT lifecycle, profile fetching, and sign-in/sign-out flows.

**Architecture decision:** a single `AuthProvider` is placed at the root of
the component tree (in `main.tsx`).  All components that need auth state
call [useAuthContext](functions/useAuthContext.md) instead of drilling props.

**Component interaction:**
- `AuthProvider` → mounts at app root, reads from `useAuth`
- `ProtectedRoute` / `PublicRoute` → read `isAuthenticated` from this context
- Login / register pages → call `signInWithEmail`, `signUpWithEmail`, etc.

## Functions

- [AuthProvider](functions/AuthProvider.md)
- [useAuthContext](functions/useAuthContext.md)
