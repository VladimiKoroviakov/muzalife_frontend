/**
 * @fileoverview FAQ types: entity shape, component props, and hook return type.
 * @module types/faq
 */

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
