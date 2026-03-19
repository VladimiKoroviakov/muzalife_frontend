/**
 * @fileoverview React hook for fetching FAQ data from the API.
 *
 * Encapsulates all data-fetching logic for the FAQ page so the UI component
 * remains a pure presenter.
 *
 * @module hooks/useFAQs
 */

import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { FAQItem, UseFAQsReturn } from '../types';

/**
 * Fetches the list of FAQ items from the backend on mount.
 *
 * **Business rule:** if the API returns an empty array the hook treats it as
 * an error state (not an empty-but-valid result) because the FAQ section
 * should always have content.  The error message is displayed to the user.
 *
 * @returns An object containing `faqs`, `loading`, and `error` state.
 *
 * @example
 * function FAQsPage() {
 *   const { faqs, loading, error } = useFAQs();
 *   if (loading) return <Spinner />;
 *   if (error)   return <ErrorState error={error} />;
 *   return faqs.map(faq => <Question key={faq.id} {...faq} />);
 * }
 */
export const useFAQs = (): UseFAQsReturn => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const data = await apiService.getFAQs();

        if (!data || data.length === 0) {
          setError('Наразі немає доступних запитань. Будь ласка, спробуйте пізніше.');
          setFaqs([]);
        } else {
          setFaqs(data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err);
        const errorMessage = err instanceof Error
          ? err.message
          : 'Не вдалося завантажити запитання. Спробуйте оновити сторінку.';
        setError(errorMessage);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  return { faqs, loading, error };
};
