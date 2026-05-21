[**MuzaLife Frontend v0.1.0**](../../../README.md)

***

[MuzaLife Frontend](../../../modules.md) / [hooks/useAdminPolls](../README.md) / useAdminPolls

# Function: useAdminPolls()

> **useAdminPolls**(): [`UseAdminPollsReturn`](../interfaces/UseAdminPollsReturn.md)

Defined in: [hooks/useAdminPolls.ts:58](https://github.com/VladimiKoroviakov/muzalife_frontend/blob/e67fb3d86b5d467b046ecab2f869b8a6a7719192/src/hooks/useAdminPolls.ts#L58)

Fetches all poll results for the admin panel and provides a close action.

Calls `GET /polls/results` (admin-only endpoint) on mount and exposes
`closePoll` which calls `PUT /polls/:id/status` then updates local state.

## Returns

[`UseAdminPollsReturn`](../interfaces/UseAdminPollsReturn.md)

`polls`, `loading`, `error`, and `closePoll` handler.

## Example

```tsx
function AdminPollsContent() {
  const { polls, loading, error, closePoll } = useAdminPolls();
  if (loading) return <Spinner />;
  if (error)   return <p>{error}</p>;
  return polls.map(p => <PollCard key={p.poll_id} poll={p} onClose={closePoll} />);
}
```
