[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [context/AuthContext](../README.md) / AuthProvider

# Function: AuthProvider()

> **AuthProvider**(`props`): `Element`

Defined in: [context/AuthContext.tsx:106](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/9132c6f38e60cc59590a5f3ade3be7eda2209c95/src/context/AuthContext.tsx#L106)

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
