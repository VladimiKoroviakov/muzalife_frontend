[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [context/AuthContext](../README.md) / useAuthContext

# Function: useAuthContext()

> **useAuthContext**(): `AuthContextType`

Defined in: [context/AuthContext.tsx:116](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/6996ace12d584a887223cea5e343c7d1430f4daa/src/context/AuthContext.tsx#L116)

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
