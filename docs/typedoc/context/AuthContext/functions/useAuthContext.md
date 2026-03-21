[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [context/AuthContext](../README.md) / useAuthContext

# Function: useAuthContext()

> **useAuthContext**(): `AuthContextType`

Defined in: [context/AuthContext.tsx:116](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a2b554aa5eceb322b09e7392eb12556651b0f442/src/context/AuthContext.tsx#L116)

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
