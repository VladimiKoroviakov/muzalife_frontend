[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [hooks/useAuth](../README.md) / useAuth

# Function: useAuth()

> **useAuth**(): `object`

Defined in: [hooks/useAuth.ts:44](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/0ca84bb63e7a3c7fb4e05dd6957419aee1e384ba/src/hooks/useAuth.ts#L44)

Core authentication hook.

Manages the full authentication lifecycle:
- Reads the stored JWT from `localStorage` on mount and validates it
  against `/api/users/profile`.
- Exposes sign-in (email + OAuth), sign-up (two-step with OTP), and
  sign-out actions.
- Maps raw API user objects to the typed AuthUser shape.

**Business logic:** the hook intentionally does not hard-redirect on auth
failure — it just clears the user state.  Routing guards
(`ProtectedRoute`, `PublicRoute`) are responsible for redirects.

## Returns

`object`

The current auth state merged with action functions.

### clearError

> **clearError**: () => `void`

#### Returns

`void`

### completeRegistration

> **completeRegistration**: (`email`, `password`, `name`, `verificationCode`) => `Promise`\<\{ `error`: `null`; `user`: `AuthUser` \| `undefined`; \} \| \{ `error`: `string`; `user?`: `undefined`; \}\>

#### Parameters

##### email

`string`

##### password

`string`

##### name

`string`

##### verificationCode

`string`

#### Returns

`Promise`\<\{ `error`: `null`; `user`: `AuthUser` \| `undefined`; \} \| \{ `error`: `string`; `user?`: `undefined`; \}\>

### error

> **error**: `string` \| `null`

### isAuthenticated

> **isAuthenticated**: `boolean` = `!!authState.user`

### isLoading

> **isLoading**: `boolean`

### refreshAuth

> **refreshAuth**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### signInWithEmail

> **signInWithEmail**: (`email`, `password`, `loginType`) => `Promise`\<\{ `error`: `null`; \} \| \{ `error`: `string`; \}\>

#### Parameters

##### email

`string`

##### password

`string`

##### loginType?

`"regular"` \| `"admin"`

#### Returns

`Promise`\<\{ `error`: `null`; \} \| \{ `error`: `string`; \}\>

### signInWithOAuth

> **signInWithOAuth**: (`provider`, `accessToken`) => `Promise`\<\{ `error`: `null`; \} \| \{ `error`: `string`; \}\>

#### Parameters

##### provider

`"google"` \| `"facebook"`

##### accessToken

`string`

#### Returns

`Promise`\<\{ `error`: `null`; \} \| \{ `error`: `string`; \}\>

### signOut

> **signOut**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### signUpWithEmail

> **signUpWithEmail**: (`email`, `password`, `name`) => `Promise`\<\{ `email`: `string`; `error`: `null`; `name`: `string`; `password`: `string`; `requiresVerification`: `boolean`; \} \| \{ `email?`: `undefined`; `error`: `string`; `name?`: `undefined`; `password?`: `undefined`; `requiresVerification`: `boolean`; \}\>

#### Parameters

##### email

`string`

##### password

`string`

##### name

`string`

#### Returns

`Promise`\<\{ `email`: `string`; `error`: `null`; `name`: `string`; `password`: `string`; `requiresVerification`: `boolean`; \} \| \{ `email?`: `undefined`; `error`: `string`; `name?`: `undefined`; `password?`: `undefined`; `requiresVerification`: `boolean`; \}\>

### user

> **user**: `AuthUser` \| `null`

## Example

```ts
// Used inside AuthProvider — don't call directly in components
const auth = useAuth();
return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
```
