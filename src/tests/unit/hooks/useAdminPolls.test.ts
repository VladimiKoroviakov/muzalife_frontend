/**
 * @fileoverview Unit tests for the {@link useAdminPolls} hook.
 *
 * Covers initial data loading, error handling, and the two mutation
 * actions (closePoll, deletePoll) including their optimistic state updates.
 *
 * @module tests/unit/hooks/useAdminPolls
 */

// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAdminPolls } from '@/hooks/useAdminPolls';
import { apiService } from '@/services/api';

vi.mock('@/services/api', () => ({
  apiService: {
    adminGetPollResults: vi.fn(),
    adminSetPollStatus: vi.fn(),
    adminDeletePoll: vi.fn(),
  },
}));

const mockGetPollResults = vi.mocked(apiService.adminGetPollResults);
const mockSetPollStatus = vi.mocked(apiService.adminSetPollStatus);
const mockDeletePoll = vi.mocked(apiService.adminDeletePoll);

const samplePolls = [
  {
    poll_id: 1,
    poll_question: 'Який тип сценарію ви любите?',
    is_active: true,
    total_votes: 10,
    options: [
      { vote_id: 1, vote_text: 'Квест', vote_count: 6, percentage: '60.0' },
      { vote_id: 2, vote_text: 'Поезія', vote_count: 4, percentage: '40.0' },
    ],
    recent_voters: [],
  },
  {
    poll_id: 2,
    poll_question: 'Скільки часу у вас на свято?',
    is_active: true,
    total_votes: 5,
    options: [
      { vote_id: 3, vote_text: '1 година', vote_count: 3, percentage: '60.0' },
      { vote_id: 4, vote_text: '2 години', vote_count: 2, percentage: '40.0' },
    ],
    recent_voters: [],
  },
  {
    poll_id: 3,
    poll_question: 'Вік аудиторії?',
    is_active: false,
    total_votes: 20,
    options: [
      { vote_id: 5, vote_text: 'До 12', vote_count: 8, percentage: '40.0' },
      { vote_id: 6, vote_text: '12–18', vote_count: 12, percentage: '60.0' },
    ],
    recent_voters: [],
  },
];

beforeEach(() => {
  vi.resetAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// Mount — fetch polls
// ─────────────────────────────────────────────────────────────────────────────
describe('useAdminPolls — initial fetch', () => {
  it('loads all polls on mount and clears loading', async () => {
    mockGetPollResults.mockResolvedValueOnce(samplePolls);
    const { result } = renderHook(() => useAdminPolls());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.polls).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it('sets a non-null error when the fetch fails and keeps polls empty', async () => {
    mockGetPollResults.mockRejectedValueOnce(new Error('Forbidden'));
    const { result } = renderHook(() => useAdminPolls());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeTruthy();
    expect(result.current.polls).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// closePoll — optimistic update
// ─────────────────────────────────────────────────────────────────────────────
describe('useAdminPolls — closePoll', () => {
  it('marks only the targeted poll as inactive while others remain unchanged', async () => {
    mockGetPollResults.mockResolvedValueOnce(samplePolls);
    mockSetPollStatus.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAdminPolls());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.closePoll(1);
    });

    const closed = result.current.polls.find((p) => p.poll_id === 1);
    const untouched = result.current.polls.find((p) => p.poll_id === 2);
    expect(closed?.is_active).toBe(false);
    expect(untouched?.is_active).toBe(true);
  });

  it('calls adminSetPollStatus with (pollId, false)', async () => {
    mockGetPollResults.mockResolvedValueOnce(samplePolls);
    mockSetPollStatus.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAdminPolls());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.closePoll(2);
    });

    expect(mockSetPollStatus).toHaveBeenCalledWith(2, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// deletePoll — optimistic removal
// ─────────────────────────────────────────────────────────────────────────────
describe('useAdminPolls — deletePoll', () => {
  it('removes the poll from local state after a successful delete', async () => {
    mockGetPollResults.mockResolvedValueOnce(samplePolls);
    mockDeletePoll.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAdminPolls());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deletePoll(2);
    });

    expect(result.current.polls).toHaveLength(2);
    expect(result.current.polls.find((p) => p.poll_id === 2)).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Mutations do not re-trigger loading
// ─────────────────────────────────────────────────────────────────────────────
describe('useAdminPolls — loading flag during mutations', () => {
  it('does not set loading to true when closePoll or deletePoll are called', async () => {
    mockGetPollResults.mockResolvedValueOnce(samplePolls);
    mockSetPollStatus.mockResolvedValueOnce(undefined);
    mockDeletePoll.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAdminPolls());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.closePoll(1);
    });
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.deletePoll(3);
    });
    expect(result.current.loading).toBe(false);
  });
});
