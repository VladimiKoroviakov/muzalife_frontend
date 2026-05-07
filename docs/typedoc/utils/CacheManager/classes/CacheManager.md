[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [utils/CacheManager](../README.md) / CacheManager

# Class: CacheManager

Defined in: [utils/cache-manager.ts:32](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/1e05f3934f91c5198d0a56555d76ae4ef688041a/src/utils/cache-manager.ts#L32)

Static utility class for `localStorage`-backed data caching.

All methods are static — no instance is needed.

## Example

```ts
// Store and retrieve products
CacheManager.setWithTimestamp('cachedProducts', products);

if (CacheManager.isCacheValid('cachedProducts', 5 * 60 * 1000)) {
  return CacheManager.getItem<Product[]>('cachedProducts');
}
```

## Constructors

### Constructor

> **new CacheManager**(): `CacheManager`

#### Returns

`CacheManager`

## Methods

### clearUserCache()

> `static` **clearUserCache**(): `void`

Defined in: [utils/cache-manager.ts:145](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/1e05f3934f91c5198d0a56555d76ae4ef688041a/src/utils/cache-manager.ts#L145)

Removes all user-specific cache entries from `localStorage`.

Called on sign-out to prevent stale data from being displayed to the
next user that logs in on the same browser.

**Purged patterns:** `cachedProducts*`, `savedProducts*`, `boughtProducts*`,
`userProfile*`, `reviewedOrders*`, `cachedPersonalOrders*`, `cachedFAQs*`,
`reviewedProducts*`, `pollsCache*`, `*_timestamp`, `authToken`.

#### Returns

`void`

#### Example

```ts
// Called automatically by useAuth on sign-out
CacheManager.clearUserCache();
```

***

### getItem()

> `static` **getItem**\<`T`\>(`key`): `T` \| `null`

Defined in: [utils/cache-manager.ts:66](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/1e05f3934f91c5198d0a56555d76ae4ef688041a/src/utils/cache-manager.ts#L66)

Reads and deserialises the value stored under `key`.

Returns `null` if the key is absent or the stored JSON is corrupt.

#### Type Parameters

##### T

`T`

The expected type of the cached value.

#### Parameters

##### key

`string`

The `localStorage` key to read.

#### Returns

`T` \| `null`

The deserialised value, or `null` on miss / error.

#### Example

```ts
const profile = CacheManager.getItem<UserProfile>('userProfile');
if (profile) { ... }
```

***

### isCacheValid()

> `static` **isCacheValid**(`key`, `duration`): `boolean`

Defined in: [utils/cache-manager.ts:125](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/1e05f3934f91c5198d0a56555d76ae4ef688041a/src/utils/cache-manager.ts#L125)

Returns `true` if the cached entry under `key` was written within the
last `duration` milliseconds.

**Algorithm:** reads `<key>_timestamp` (set by [setWithTimestamp](#setwithtimestamp))
and compares it to `Date.now()`.

#### Parameters

##### key

`string`

The cache key (without the `_timestamp` suffix).

##### duration

`number`

Maximum age in milliseconds before the cache is
                  considered stale (e.g. `5 * 60 * 1000` for 5 minutes).

#### Returns

`boolean`

`true` if the entry exists and is still within `duration`; `false` otherwise.

#### Example

```ts
if (CacheManager.isCacheValid('cachedProducts', 5 * 60 * 1000)) {
  return CacheManager.getItem<Product[]>('cachedProducts');
}
```

***

### removeItem()

> `static` **removeItem**(`key`): `void`

Defined in: [utils/cache-manager.ts:84](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/1e05f3934f91c5198d0a56555d76ae4ef688041a/src/utils/cache-manager.ts#L84)

Removes the entry stored under `key` from `localStorage`.

#### Parameters

##### key

`string`

The `localStorage` key to remove.

#### Returns

`void`

#### Example

```ts
CacheManager.removeItem('userProfile');
```

***

### setItem()

> `static` **setItem**\<`T`\>(`key`, `value`): `void`

Defined in: [utils/cache-manager.ts:45](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/1e05f3934f91c5198d0a56555d76ae4ef688041a/src/utils/cache-manager.ts#L45)

Serialises `value` to JSON and writes it to `localStorage` under `key`.

Silently swallows storage errors (e.g. quota exceeded, private browsing).

#### Type Parameters

##### T

`T`

The type of the value being stored.

#### Parameters

##### key

`string`

The `localStorage` key.

##### value

`T`

The value to cache; must be JSON-serialisable.

#### Returns

`void`

#### Example

```ts
CacheManager.setItem('userProfile', { id: 1, name: 'Alice' });
```

***

### setWithTimestamp()

> `static` **setWithTimestamp**(`key`, `value`): `void`

Defined in: [utils/cache-manager.ts:103](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/1e05f3934f91c5198d0a56555d76ae4ef688041a/src/utils/cache-manager.ts#L103)

Stores `value` under `key` and records the current timestamp under
`<key>_timestamp` so that freshness can be checked later with
[isCacheValid](#iscachevalid).

#### Parameters

##### key

`string`

The `localStorage` key for the data.

##### value

`any`

The value to cache.

#### Returns

`void`

#### Example

```ts
CacheManager.setWithTimestamp('cachedFAQs', faqs);
```
