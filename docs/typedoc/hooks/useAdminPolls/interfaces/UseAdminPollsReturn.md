[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [hooks/useAdminPolls](../README.md) / UseAdminPollsReturn

# Interface: UseAdminPollsReturn

Defined in: [hooks/useAdminPolls.ts:17](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/e36b1522ae7a73fe398af900d83490e15192c8c8/src/hooks/useAdminPolls.ts#L17)

Return shape of [useAdminPolls](../functions/useAdminPolls.md).

## Properties

### closePoll

> **closePoll**: (`pollId`) => `Promise`\<`void`\>

Defined in: [hooks/useAdminPolls.ts:30](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/e36b1522ae7a73fe398af900d83490e15192c8c8/src/hooks/useAdminPolls.ts#L30)

Closes the poll with the given ID by setting `is_active` to `false`.
Optimistically updates local state on success.

#### Parameters

##### pollId

`number`

ID of the poll to close.

#### Returns

`Promise`\<`void`\>

***

### deletePoll

> **deletePoll**: (`pollId`) => `Promise`\<`void`\>

Defined in: [hooks/useAdminPolls.ts:37](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/e36b1522ae7a73fe398af900d83490e15192c8c8/src/hooks/useAdminPolls.ts#L37)

Permanently deletes the poll with the given ID.
Removes it from local state on success.

#### Parameters

##### pollId

`number`

ID of the poll to delete.

#### Returns

`Promise`\<`void`\>

***

### error

> **error**: `string` \| `null`

Defined in: [hooks/useAdminPolls.ts:23](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/e36b1522ae7a73fe398af900d83490e15192c8c8/src/hooks/useAdminPolls.ts#L23)

Non-null when the fetch failed; contains a user-readable Ukrainian message.

***

### loading

> **loading**: `boolean`

Defined in: [hooks/useAdminPolls.ts:21](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/e36b1522ae7a73fe398af900d83490e15192c8c8/src/hooks/useAdminPolls.ts#L21)

`true` while the initial fetch is in flight.

***

### polls

> **polls**: `PollResult`[]

Defined in: [hooks/useAdminPolls.ts:19](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/e36b1522ae7a73fe398af900d83490e15192c8c8/src/hooks/useAdminPolls.ts#L19)

All polls with per-option vote counts, including inactive ones.
