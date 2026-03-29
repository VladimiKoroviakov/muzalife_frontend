[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [context/AuthContext](../README.md) / AuthProvider

# Function: AuthProvider()

> **AuthProvider**(`props`): `Element`

Defined in: [context/AuthContext.tsx:91](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/365e67c70bc7b9e01755e323412cff096ddbd74c/src/context/AuthContext.tsx#L91)

Provides authentication state to the entire component tree.

Place this at the root of the application (above the router):

```tsx
<AuthProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</AuthProvider>
```

## Parameters

### props

Component props.

#### children

`ReactNode`

Child components that will have access to auth context.

## Returns

`Element`
