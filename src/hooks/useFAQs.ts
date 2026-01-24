import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { FAQItem, UseFAQsReturn } from '../types';

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