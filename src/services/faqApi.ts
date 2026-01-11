import { FAQItem, ApiResponse } from '../types';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const faqApi = {
  // Get all FAQs
  async getFAQs(): Promise<FAQItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/faqs`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<FAQItem[]> = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch FAQs');
      }
    } catch (error) {
      console.error('Error fetching FAQs from API:', error);
      throw error;
    }
  },

  // Get single FAQ by ID
  async getFAQById(id: number): Promise<FAQItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/faqs/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<FAQItem> = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch FAQ');
      }
    } catch (error) {
      console.error('Error fetching FAQ from API:', error);
      throw error;
    }
  }
};