/**
 * @fileoverview Unit tests for {@link createPollsMethods}.
 *
 * @module tests/unit/services/polls
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPollsMethods } from '@/services/api/polls';
import type { ApiClient } from '@/services/api/client';
import { ApiError } from '@/types';
import config from '@/config';

const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  authRequest: vi.fn(),
  postWithCustomAuth: vi.fn(),
  clearUserData: vi.fn(),
  clearProductsCache: vi.fn(),
  clearAllCache: vi.fn(),
  getCachedArray: vi.fn(),
  updateCachedArray: vi.fn(),
  token: null as string | null,
} as unknown as ApiClient;

const sampleApiPoll = {
  poll_id: 1,
  poll_question: 'Яку тему обрати?',
  is_active: true,
  user_has_voted: false,
  total_votes: 10,
  options: [
    { vote_id: 1, vote_text: 'Новий рік' },
    { vote_id: 2, vote_text: 'День народження' },
  ],
  recent_voters: [{ userId: 1, name: 'Олена' }],
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getPolls — success path', () => {
  it('returns mapped and filtered polls (not voted, active)', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({
      success: true,
      polls: [sampleApiPoll],
    });

    const { getPolls } = createPollsMethods(mockClient);
    const result = await getPolls();

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.polls.base);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(result[0].question).toBe('Яку тему обрати?');
    expect(result[0].options).toEqual(['Новий рік', 'День народження']);
    expect(result[0].optionVoteIds).toEqual([1, 2]);
    expect(result[0].hasVoted).toBe(false);
    expect(result[0].voteCount).toBe(10);
    expect(result[0].selectedOption).toBeNull();
  });

  it('filters out polls where user has already voted', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({
      success: true,
      polls: [{ ...sampleApiPoll, user_has_voted: true }],
    });

    const { getPolls } = createPollsMethods(mockClient);
    const result = await getPolls();

    expect(result).toHaveLength(0);
  });

  it('filters out inactive polls', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({
      success: true,
      polls: [{ ...sampleApiPoll, is_active: false }],
    });

    const { getPolls } = createPollsMethods(mockClient);
    const result = await getPolls();

    expect(result).toHaveLength(0);
  });

  it('handles poll with no options gracefully', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({
      success: true,
      polls: [{ ...sampleApiPoll, options: undefined, recent_voters: undefined }],
    });

    const { getPolls } = createPollsMethods(mockClient);
    const result = await getPolls();

    expect(result[0].options).toEqual([]);
    expect(result[0].voters).toEqual([]);
  });

  it('handles zero total_votes', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({
      success: true,
      polls: [{ ...sampleApiPoll, total_votes: undefined }],
    });

    const { getPolls } = createPollsMethods(mockClient);
    const result = await getPolls();

    expect(result[0].voteCount).toBe(0);
  });
});

describe('getPolls — error paths', () => {
  it('throws when response.success is false', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, error: 'DB error', polls: [] });

    const { getPolls } = createPollsMethods(mockClient);
    await expect(getPolls()).rejects.toThrow('DB error');
  });

  it('wraps 401 ApiError with Ukrainian authentication message', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new ApiError('Unauthorized', 401));

    const { getPolls } = createPollsMethods(mockClient);
    await expect(getPolls()).rejects.toThrow('Будь ласка, увійдіть в систему');
  });

  it('rethrows non-401 ApiError as-is', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new ApiError('Forbidden', 403));

    const { getPolls } = createPollsMethods(mockClient);
    await expect(getPolls()).rejects.toThrow('Forbidden');
  });
});

describe('getPollDetails', () => {
  it('returns poll details on success', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, poll: sampleApiPoll });

    const { getPollDetails } = createPollsMethods(mockClient);
    const result = await getPollDetails(1);

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.polls.byId(1));
    expect(result).toEqual(sampleApiPoll);
  });

  it('throws when response.success is false', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, error: 'Not found', poll: null });

    const { getPollDetails } = createPollsMethods(mockClient);
    await expect(getPollDetails(999)).rejects.toThrow('Not found');
  });

  it('wraps 404 ApiError with Ukrainian "not found" message', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new ApiError('Not found', 404));

    const { getPollDetails } = createPollsMethods(mockClient);
    await expect(getPollDetails(1)).rejects.toThrow('Опитування не знайдено');
  });

  it('rethrows non-404 errors', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new Error('Server error'));

    const { getPollDetails } = createPollsMethods(mockClient);
    await expect(getPollDetails(1)).rejects.toThrow('Server error');
  });
});

describe('submitVote', () => {
  it('submits a vote successfully', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true });

    const { submitVote } = createPollsMethods(mockClient);
    await expect(submitVote(1, 2)).resolves.toBeUndefined();

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.polls.vote(1),
      { vote_id: 2 }
    );
  });

  it('throws when response.success is false', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: false, error: 'Vote failed' });

    const { submitVote } = createPollsMethods(mockClient);
    await expect(submitVote(1, 2)).rejects.toThrow('Vote failed');
  });

  it('throws generic message when success false and no error', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: false });

    const { submitVote } = createPollsMethods(mockClient);
    await expect(submitVote(1, 2)).rejects.toThrow('Не вдалося надіслати голос');
  });

  it('wraps 401 ApiError with Ukrainian authentication message', async () => {
    vi.mocked(mockClient.post).mockRejectedValue(new ApiError('Unauthorized', 401));

    const { submitVote } = createPollsMethods(mockClient);
    await expect(submitVote(1, 2)).rejects.toThrow('Будь ласка, увійдіть в систему');
  });

  it('wraps 400 ApiError with Ukrainian invalid request message', async () => {
    vi.mocked(mockClient.post).mockRejectedValue(new ApiError('Bad request', 400));

    const { submitVote } = createPollsMethods(mockClient);
    await expect(submitVote(1, 2)).rejects.toThrow('Невірний запит на голосування');
  });

  it('rethrows other errors', async () => {
    vi.mocked(mockClient.post).mockRejectedValue(new Error('Network error'));

    const { submitVote } = createPollsMethods(mockClient);
    await expect(submitVote(1, 2)).rejects.toThrow('Network error');
  });
});
