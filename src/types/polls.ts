/**
 * @fileoverview Polls and voting types: entities, API shapes, and component props.
 * @module types/polls
 */

export interface VoterData {
  name: string;
  imageUrl: string | null;
}

export interface Poll {
  id: number;
  question: string;
  options: string[];
  optionVoteIds: number[];
  selectedOption: number | null;
  hasVoted: boolean;
  voteCount: number;
  voters: VoterData[];
}

export interface ApiPoll {
  poll_id: number;
  poll_question: string;
  is_active: boolean;
  total_votes: number;
  user_has_voted: boolean;
  options?: Array<{
    vote_id: number;
    vote_text: string;
    vote_count: number;
  }>;
}

export interface PollsResponse {
  polls: ApiPoll[];
}

export interface VoteRequest {
  vote_id: number;
}

export interface VoteResponse {
  success: boolean;
  error?: string;
}

export interface PollDetailsResponse {
  success: boolean;
  poll: ApiPoll;
  error?: string;
}

export interface OptionProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export interface OptionsProps {
  options: string[];
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
}

export interface VotersProps {
  voters: VoterData[];
}

export interface VotesProps {
  voteCount: number;
  voters: VoterData[];
}

export interface RowProps {
  voteCount: number;
  voters: VoterData[];
  onVote: () => void;
  hasSelection: boolean;
}

export interface VotedCardProps {
  message?: string;
}

export interface PollCardProps {
  question: string;
  options: string[];
  pollIndex: number;
  hasVoted: boolean;
  selectedOption: number | null;
  voteCount: number;
  voters: VoterData[];
  onSelectOption: (pollIndex: number, optionIndex: number) => void;
  onVote: (pollIndex: number) => void;
}

export interface CreatePollData {
  pollQuestion: string;
  options: string[];
}

export interface PollResult {
  poll_id: number;
  poll_question: string;
  is_active: boolean;
  total_votes: number;
  options: Array<{
    vote_id: number;
    vote_text: string;
    vote_count: number;
    /** Pre-computed percentage string from the backend, e.g. `"66.7"`. */
    percentage: string;
  }>;
}

export interface PollResultsResponse {
  success: boolean;
  polls: PollResult[];
  error?: string;
}

export interface AdminPollResponse {
  success: boolean;
  poll?: ApiPoll;
  error?: string;
}
