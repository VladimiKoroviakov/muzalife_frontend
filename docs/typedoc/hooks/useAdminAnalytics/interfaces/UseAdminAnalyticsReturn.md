[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [hooks/useAdminAnalytics](../README.md) / UseAdminAnalyticsReturn

# Interface: UseAdminAnalyticsReturn

Defined in: [hooks/useAdminAnalytics.ts:26](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a6505c2e66b196756068c4aef787d788857c5209/src/hooks/useAdminAnalytics.ts#L26)

Return shape of [useAdminAnalytics](../functions/useAdminAnalytics.md).

## Properties

### analytics

> **analytics**: `ProductAnalytics` \| `null`

Defined in: [hooks/useAdminAnalytics.ts:57](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a6505c2e66b196756068c4aef787d788857c5209/src/hooks/useAdminAnalytics.ts#L57)

Engagement stats for the selected product in the current window.

***

### analyticsLoading

> **analyticsLoading**: `boolean`

Defined in: [hooks/useAdminAnalytics.ts:59](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a6505c2e66b196756068c4aef787d788857c5209/src/hooks/useAdminAnalytics.ts#L59)

`true` while stats are loading.

***

### customRange

> **customRange**: [`DateRange`](DateRange.md)

Defined in: [hooks/useAdminAnalytics.ts:48](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a6505c2e66b196756068c4aef787d788857c5209/src/hooks/useAdminAnalytics.ts#L48)

Custom date range; only used when `timeFilter === 'custom'`.

***

### products

> **products**: `AnalyticsProduct`[]

Defined in: [hooks/useAdminAnalytics.ts:28](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a6505c2e66b196756068c4aef787d788857c5209/src/hooks/useAdminAnalytics.ts#L28)

Full product list including hidden/soft-deleted products.

***

### productsLoading

> **productsLoading**: `boolean`

Defined in: [hooks/useAdminAnalytics.ts:30](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a6505c2e66b196756068c4aef787d788857c5209/src/hooks/useAdminAnalytics.ts#L30)

`true` while the product list is loading.

***

### reviews

> **reviews**: `Review`[]

Defined in: [hooks/useAdminAnalytics.ts:61](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a6505c2e66b196756068c4aef787d788857c5209/src/hooks/useAdminAnalytics.ts#L61)

Reviews for the selected product (not date-filtered).

***

### reviewsLoading

> **reviewsLoading**: `boolean`

Defined in: [hooks/useAdminAnalytics.ts:63](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a6505c2e66b196756068c4aef787d788857c5209/src/hooks/useAdminAnalytics.ts#L63)

`true` while reviews are loading.

***

### selectedProductId

> **selectedProductId**: `number` \| `null`

Defined in: [hooks/useAdminAnalytics.ts:32](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a6505c2e66b196756068c4aef787d788857c5209/src/hooks/useAdminAnalytics.ts#L32)

ID of the currently selected product, or `null` before the list loads.

***

### selectProduct

> **selectProduct**: (`id`) => `void`

Defined in: [hooks/useAdminAnalytics.ts:38](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a6505c2e66b196756068c4aef787d788857c5209/src/hooks/useAdminAnalytics.ts#L38)

Sets the active product and triggers a stats + reviews reload.

#### Parameters

##### id

`number`

Product ID to select.

#### Returns

`void`

***

### setCustomRange

> **setCustomRange**: (`range`) => `void`

Defined in: [hooks/useAdminAnalytics.ts:55](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a6505c2e66b196756068c4aef787d788857c5209/src/hooks/useAdminAnalytics.ts#L55)

Updates the custom date range. Automatically switches `timeFilter` to
`'custom'` so the stats reload picks up the new bounds.

#### Parameters

##### range

[`DateRange`](DateRange.md)

New date range.

#### Returns

`void`

***

### setTimeFilter

> **setTimeFilter**: (`f`) => `void`

Defined in: [hooks/useAdminAnalytics.ts:46](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a6505c2e66b196756068c4aef787d788857c5209/src/hooks/useAdminAnalytics.ts#L46)

Switches the active preset and triggers a stats reload.

#### Parameters

##### f

[`TimeFilter`](../type-aliases/TimeFilter.md)

New preset to activate.

#### Returns

`void`

***

### timeFilter

> **timeFilter**: [`TimeFilter`](../type-aliases/TimeFilter.md)

Defined in: [hooks/useAdminAnalytics.ts:40](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/a6505c2e66b196756068c4aef787d788857c5209/src/hooks/useAdminAnalytics.ts#L40)

Active time-window preset.
