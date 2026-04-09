/**
 * @fileoverview React hook for admin polls management.
 *
 * Encapsulates fetching all poll results and toggling poll active status
 * so the admin polls UI remains a pure presenter.
 *
 * @module hooks/useAdminPolls
 */

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { PollResult } from '../types';

/**
 * Return shape of {@link useAdminPolls}.
 */
export interface UseAdminPollsReturn {
  /** All polls with per-option vote counts, including inactive ones. */
  polls: PollResult[];
  /** `true` while the initial fetch is in flight. */
  loading: boolean;
  /** Non-null when the fetch failed; contains a user-readable Ukrainian message. */
  error: string | null;
  /**
   * Closes the poll with the given ID by setting `is_active` to `false`.
   * Optimistically updates local state on success.
   *
   * @param pollId - ID of the poll to close.
   */
  closePoll: (pollId: number) => Promise<void>;
  /**
   * Permanently deletes the poll with the given ID.
   * Removes it from local state on success.
   *
   * @param pollId - ID of the poll to delete.
   */
  deletePoll: (pollId: number) => Promise<void>;
}

/**
 * Fetches all poll results for the admin panel and provides a close action.
 *
 * Calls `GET /polls/results` (admin-only endpoint) on mount and exposes
 * `closePoll` which calls `PUT /polls/:id/status` then updates local state.
 *
 * @returns `polls`, `loading`, `error`, and `closePoll` handler.
 *
 * @example
 * ```tsx
 * function AdminPollsContent() {
 *   const { polls, loading, error, closePoll } = useAdminPolls();
 *   if (loading) return <Spinner />;
 *   if (error)   return <p>{error}</p>;
 *   return polls.map(p => <PollCard key={p.poll_id} poll={p} onClose={closePoll} />);
 * }
 * ```
 */
export const useAdminPolls = (): UseAdminPollsReturn => {
  const [polls, setPolls] = useState<PollResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        const data = await apiService.adminGetPollResults();
        setPolls(data);
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Не вдалося завантажити опитування. Спробуйте оновити сторінку.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  const closePoll = useCallback(async (pollId: number) => {
    await apiService.adminSetPollStatus(pollId, false);
    setPolls((prev) =>
      prev.map((p) => (p.poll_id === pollId ? { ...p, is_active: false } : p)),
    );
  }, []);

  const deletePoll = useCallback(async (pollId: number) => {
    await apiService.adminDeletePoll(pollId);
    setPolls((prev) => prev.filter((p) => p.poll_id !== pollId));
  }, []);

  return { polls, loading, error, closePoll, deletePoll };
};
