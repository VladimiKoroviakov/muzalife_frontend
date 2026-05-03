[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [hooks/useAdminAnalytics](../README.md) / useAdminAnalytics

# Function: useAdminAnalytics()

> **useAdminAnalytics**(): [`UseAdminAnalyticsReturn`](../interfaces/UseAdminAnalyticsReturn.md)

Defined in: [hooks/useAdminAnalytics.ts:100](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a6505c2e66b196756068c4aef787d788857c5209/src/hooks/useAdminAnalytics.ts#L100)

Provides all data and actions for the admin analytics panel.

- Fetches the product list (including hidden products) on mount.
- Re-fetches engagement stats whenever the selected product or date window changes.
- Re-fetches reviews whenever the selected product changes.

## Returns

[`UseAdminAnalyticsReturn`](../interfaces/UseAdminAnalyticsReturn.md)

Analytics state and action callbacks.

## Example

```tsx
function AdminAnalyticsContent() {
  const { products, selectedProductId, selectProduct, analytics } = useAdminAnalytics();
  return (
    <div>
      {products.map(p => (
        <button key={p.id} onClick={() => selectProduct(p.id)}>{p.title}</button>
      ))}
      <p>Views: {analytics?.views ?? 0}</p>
    </div>
  );
}
```
