/**
 * @fileoverview FAQ API methods.
 *
 * @module services/api/faqs
 */

import config from '../../config';
import { CacheManager } from '../../utils/cache-manager';
import { FAQItem, ApiResponse } from '../../types';
import { ApiClient } from './client';

/**
 * Creates FAQ methods bound to the given HTTP client.
 *
 * @param client - Shared API transport client.
 * @returns Object containing all FAQ API methods.
 * @example
 * ```ts
 * const { getFAQs } = createFaqsMethods(client);
 * const faqs = await getFAQs();
 * ```
 */
export function createFaqsMethods(client: ApiClient) {
  return {
    async getFAQs(): Promise<FAQItem[]> {
      const cachedFAQs = CacheManager.getItem<FAQItem[]>(config.cacheKeys.FAQS);
      const isCacheValid = CacheManager.isCacheValid(
        config.cacheKeys.FAQS,
        config.cacheDurations.FAQS
      );

      if (cachedFAQs && isCacheValid) {
        return cachedFAQs;
      }

      try {
        const response = await client.get<ApiResponse<FAQItem[]>>(config.endpoints.faqs);

        if (response.success && Array.isArray(response.data)) {
          CacheManager.setWithTimestamp(config.cacheKeys.FAQS, response.data);
          return response.data;
        }

        throw new Error(response.error || 'Failed to fetch FAQs');
      } catch (error) {
        if (cachedFAQs) {
          return cachedFAQs;
        }
        throw error;
      }
    },

    async getFAQById(id: number): Promise<FAQItem> {
      const response = await client.get<ApiResponse<FAQItem>>(`${config.endpoints.faqs}/${id}`);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error || 'Failed to fetch FAQ');
    },
  };
}
