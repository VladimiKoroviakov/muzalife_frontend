/**
 * @fileoverview Product reviews API methods.
 *
 * @module services/api/reviews
 */

import config from '../../config';
import { Review, ApiError } from '../../types';
import { ApiClient } from './client';

/**
 * Creates product-review methods bound to the given HTTP client.
 *
 * @param client - Shared API transport client.
 * @returns Object containing all review API methods.
 * @example
 * ```ts
 * const { submitReview } = createReviewsMethods(client);
 * await submitReview(42, 5, 'Чудовий сценарій!');
 * ```
 */
export function createReviewsMethods(client: ApiClient) {
  return {
    async getReviewsByProductId(productId: number): Promise<Review[]> {
      try {
        return await client.get<Review[]>(`${config.endpoints.reviews}/product/${productId}`);
      } catch (error) {
        // Backend may return 404 when a product has no reviews yet
        if (error instanceof ApiError && error.status === 404) {
          return [];
        }
        throw error;
      }
    },

    async getUserReviews(userId: number): Promise<Review[]> {
      try {
        return await client.get<Review[]>(`${config.endpoints.reviews}/user/${userId}`);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          // User has no reviews
          return [];
        }
        throw error;
      }
    },

    async submitReview(productId: number, rating: number, comment: string): Promise<Review> {
      try {
        const review = await client.post<Review>(
          config.endpoints.reviews,
          { productId, rating, comment }
        );

        client.clearProductsCache();
        return review;
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          throw new Error('Ви вже залишили відгук на цей продукт', { cause: error });
        }
        throw error;
      }
    },

    async updateReview(reviewId: number, rating?: number, comment?: string): Promise<Review> {
      const updateData: { rating?: number; comment?: string } = {};
      if (rating !== undefined) { updateData.rating = rating; }
      if (comment !== undefined) { updateData.comment = comment; }

      const review = await client.put<Review>(
        `${config.endpoints.reviews}/${reviewId}`,
        updateData
      );

      client.clearProductsCache();
      return review;
    },

    async deleteReview(reviewId: number): Promise<void> {
      await client.delete(`${config.endpoints.reviews}/${reviewId}`);
      client.clearProductsCache();
    },
  };
}
