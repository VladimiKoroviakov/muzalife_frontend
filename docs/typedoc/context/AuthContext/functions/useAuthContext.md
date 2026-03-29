[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [context/AuthContext](../README.md) / useAuthContext

# Function: useAuthContext()

> **useAuthContext**(): `AuthContextType`

Defined in: [context/AuthContext.tsx:116](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/365e67c70bc7b9e01755e323412cff096ddbd74c/src/context/AuthContext.tsx#L116)

Custom hook that returns the current AuthContextType value.

Must be called from inside a component that is wrapped by
[AuthProvider](AuthProvider.md).  Throws if used outside the provider tree.

## Returns

`AuthContextType`

The auth context value containing state and action functions.

## Throws

If called outside of an `AuthProvider`.

## Example

```ts
function MyComponent() {
  const { user, signOut } = useAuthContext();
  return <button onClick={signOut}>{user?.name}</button>;
}
```
