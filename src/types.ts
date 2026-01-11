import { ReactNode } from "react";

// Product types
export type Product = {
  id: number;
  title: string;
  price: number;
  rating: number;
  type: "Сценарій" | "Квест" | "Поезія" | "Безкоштовні матеріали" | "Інше";
  image: string;
  ageCategory: string;
  events: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
  additionalImages: string[];
}

export type ProductCardProps = {
  id: number;
  title: string;
  price: number;
  rating: number;
  image: string;
  badgeText: string;
  badgeColor?: string;
  isInCart?: boolean;
  isBookmarked?: boolean;
  showBookmark?: boolean;
  showDelete?: boolean;

  // Event Handlers
  onClick?: () => void;
  onCartClick?: () => void;
  onBookmarkClick?: () => void;
  onDeleteClick?: () => void;
};

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  auth_provider: 'email' | 'google' | 'facebook';
  created_at: string;
  is_admin?: boolean;
};

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
  details?: string;
}

// FAQ types
export interface QuestionProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export interface UseFAQsReturn {
  faqs: FAQItem[];
  loading: boolean;
  error: string | null;
}

export interface ErrorStateProps {
  error: string;
}

export interface AuthLogoTitleProps {
  children: ReactNode;
  logoSize?: number;
}

export interface IconBookmarksProps {
  isBookmarked: boolean;
}

export interface LocalMallProps {
  count: number;
}

export interface HelpProps {
  onClick?: () => void;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UseSingleProduct {
  product: Product | null;
  reviews: Review[];
  galleryImages: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface CloseButtonProps {
  onClick?: () => void;
}

// Polls & Votes types
export interface VoterData {
  name: string;
  imageUrl: string | null;
}

export interface Poll {
  id: number;
  question: string;
  options: string[];
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

// Component Props Interfaces
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