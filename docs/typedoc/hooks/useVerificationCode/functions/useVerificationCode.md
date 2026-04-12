[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [hooks/useVerificationCode](../README.md) / useVerificationCode

# Function: useVerificationCode()

> **useVerificationCode**(`__namedParameters`): `object`

Defined in: [hooks/useVerificationCode.ts:11](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/2d822b275568b968380e0ec42bc501946a042429/src/hooks/useVerificationCode.ts#L11)

## Parameters

### \_\_namedParameters

`UseVerificationCodeOptions`

## Returns

`object`

### canResend

> **canResend**: `boolean`

### code

> **code**: `string`[]

### countdown

> **countdown**: `number`

### error

> **error**: `string` \| `null`

### getCode

> **getCode**: () => `string`

#### Returns

`string`

### inputRefs

> **inputRefs**: `RefObject`\<(`HTMLInputElement` \| `null`)[]\>

### isResending

> **isResending**: `boolean`

### isSubmitting

> **isSubmitting**: `boolean`

### onChange

> **onChange**: (`index`, `e`) => `void`

#### Parameters

##### index

`number`

##### e

`ChangeEvent`\<`HTMLInputElement`\>

#### Returns

`void`

### onKeyDown

> **onKeyDown**: (`e`) => `void`

#### Parameters

##### e

`KeyboardEvent`\<`HTMLInputElement`\>

#### Returns

`void`

### onPaste

> **onPaste**: (`e`) => `void`

#### Parameters

##### e

`ClipboardEvent`\<`HTMLInputElement`\>

#### Returns

`void`

### reset

> **reset**: () => `void`

#### Returns

`void`

### setError

> **setError**: `Dispatch`\<`SetStateAction`\<`string` \| `null`\>\>

### setIsResending

> **setIsResending**: `Dispatch`\<`SetStateAction`\<`boolean`\>\>

### setIsSubmitting

> **setIsSubmitting**: `Dispatch`\<`SetStateAction`\<`boolean`\>\>
