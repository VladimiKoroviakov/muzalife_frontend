[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [context/AuthContext](../README.md) / AuthProvider

# Function: AuthProvider()

> **AuthProvider**(`props`): `Element`

Defined in: [context/AuthContext.tsx:106](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/e4b003310f8b13e4799042d43084af0b4fee8d0d/src/context/AuthContext.tsx#L106)

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
