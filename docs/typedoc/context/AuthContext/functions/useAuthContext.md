[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [context/AuthContext](../README.md) / useAuthContext

# Function: useAuthContext()

> **useAuthContext**(): `AuthContextType`

Defined in: [context/AuthContext.tsx:131](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/ae1b820f177642e29f353eb1b798ae3e8f99bad1/src/context/AuthContext.tsx#L131)

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
