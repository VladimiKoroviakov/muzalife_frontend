/**
 * @fileoverview Community polls API methods.
 *
 * @module services/api/polls
 */

import config from '../../config';
import { Poll, ApiPoll, VoterData, ApiError } from '../../types';
import { ApiClient } from './client';

/**
 * Creates community-polls methods bound to the given HTTP client.
 *
 * @param client - Shared API transport client.
 * @returns Object containing all polls API methods.
 * @example
 * ```ts
 * const { getPolls } = createPollsMethods(client);
 * const polls = await getPolls();
 * ```
 */
export function createPollsMethods(client: ApiClient) {
  return {
    async getPolls(): Promise<Poll[]> {
      try {
        const response = await client.get<{
          success: boolean;
          polls: ApiPoll[];
          error?: string;
        }>(config.endpoints.polls.base);

        if (response.success && Array.isArray(response.polls)) {
          const polls: Poll[] = response.polls
            .filter((apiPoll: ApiPoll) => !apiPoll.user_has_voted && apiPoll.is_active)
            .map((apiPoll: ApiPoll) => {
              const options = apiPoll.options?.map((opt) => opt.vote_text) || [];
              const optionVoteIds = apiPoll.options?.map((opt) => opt.vote_id) || [];

              const voters: VoterData[] = apiPoll.recent_voters ?? [];

              return {
                id: apiPoll.poll_id,
                question: apiPoll.poll_question,
                options,
                optionVoteIds,
                selectedOption: null,
                hasVoted: apiPoll.user_has_voted,
                voteCount: apiPoll.total_votes || 0,
                voters,
              };
            });

          return polls;
        }

        throw new Error(response.error || 'Failed to fetch polls');
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          throw new Error('Будь ласка, увійдіть в систему, щоб переглядати опитування', { cause: error });
        }
        throw error;
      }
    },

    async getPollDetails(pollId: number): Promise<ApiPoll> {
      try {
        const response = await client.get<{
          success: boolean;
          poll: ApiPoll;
          error?: string;
        }>(config.endpoints.polls.byId(pollId));

        if (response.success && response.poll) {
          return response.poll;
        }

        throw new Error(response.error || 'Failed to fetch poll details');
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          throw new Error('Опитування не знайдено', { cause: error });
        }
        throw error;
      }
    },

    async submitVote(pollId: number, voteId: number): Promise<void> {
      try {
        const response = await client.post<{
          success: boolean;
          error?: string;
        }>(
          config.endpoints.polls.vote(pollId),
          { vote_id: voteId }
        );

        if (!response.success) {
          throw new Error(response.error || 'Не вдалося надіслати голос');
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          throw new Error('Будь ласка, увійдіть в систему, щоб проголосувати', { cause: error });
        }
        if (error instanceof ApiError && error.status === 400) {
          throw new Error('Невірний запит на голосування', { cause: error });
        }
        throw error;
      }
    },
  };
}
