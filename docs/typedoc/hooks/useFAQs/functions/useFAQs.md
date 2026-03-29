[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [hooks/useFAQs](../README.md) / useFAQs

# Function: useFAQs()

> **useFAQs**(): [`UseFAQsReturn`](../../../types/interfaces/UseFAQsReturn.md)

Defined in: [hooks/useFAQs.ts:31](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/4624aee8b63690c88d220a5b24312b12672b1c17/src/hooks/useFAQs.ts#L31)

Fetches the list of FAQ items from the backend on mount.

**Business rule:** if the API returns an empty array the hook treats it as
an error state (not an empty-but-valid result) because the FAQ section
should always have content.  The error message is displayed to the user.

## Returns

[`UseFAQsReturn`](../../../types/interfaces/UseFAQsReturn.md)

An object containing `faqs`, `loading`, and `error` state.

## Example

```ts
function FAQsPage() {
  const { faqs, loading, error } = useFAQs();
  if (loading) return <Spinner />;
  if (error)   return <ErrorState error={error} />;
  return faqs.map(faq => <Question key={faq.id} {...faq} />);
}
```
