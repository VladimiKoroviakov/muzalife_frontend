/**
 * @fileoverview Unit tests for {@link createReviewsMethods}.
 *
 * @module tests/unit/services/reviews
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReviewsMethods } from '@/services/api/reviews';
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

const sampleReview = {
  id: 1,
  productId: 42,
  userId: 7,
  rating: 5,
  comment: 'Чудовий сценарій!',
  createdAt: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getReviewsByProductId', () => {
  it('returns reviews for the given product', async () => {
    vi.mocked(mockClient.get).mockResolvedValue([sampleReview]);

    const { getReviewsByProductId } = createReviewsMethods(mockClient);
    const result = await getReviewsByProductId(42);

    expect(mockClient.get).toHaveBeenCalledWith(`${config.endpoints.reviews}/product/42`);
    expect(result).toEqual([sampleReview]);
  });

  it('returns empty array when backend responds with 404 (no reviews yet)', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new ApiError('Not found', 404));

    const { getReviewsByProductId } = createReviewsMethods(mockClient);
    const result = await getReviewsByProductId(42);

    expect(result).toEqual([]);
  });

  it('rethrows non-404 errors', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new ApiError('Server error', 500));

    const { getReviewsByProductId } = createReviewsMethods(mockClient);
    await expect(getReviewsByProductId(42)).rejects.toThrow('Server error');
  });
});

describe('getUserReviews', () => {
  it('returns reviews for the given user', async () => {
    vi.mocked(mockClient.get).mockResolvedValue([sampleReview]);

    const { getUserReviews } = createReviewsMethods(mockClient);
    const result = await getUserReviews(7);

    expect(mockClient.get).toHaveBeenCalledWith(`${config.endpoints.reviews}/user/7`);
    expect(result).toEqual([sampleReview]);
  });

  it('returns empty array when user has no reviews (404)', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new ApiError('Not found', 404));

    const { getUserReviews } = createReviewsMethods(mockClient);
    const result = await getUserReviews(7);

    expect(result).toEqual([]);
  });

  it('rethrows non-404 errors', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new ApiError('Forbidden', 403));

    const { getUserReviews } = createReviewsMethods(mockClient);
    await expect(getUserReviews(7)).rejects.toThrow('Forbidden');
  });
});

describe('submitReview', () => {
  it('posts a review, clears products cache, and returns the review', async () => {
    vi.mocked(mockClient.post).mockResolvedValue(sampleReview);

    const { submitReview } = createReviewsMethods(mockClient);
    const result = await submitReview(42, 5, 'Чудовий!');

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.reviews,
      { productId: 42, rating: 5, comment: 'Чудовий!' }
    );
    expect(mockClient.clearProductsCache).toHaveBeenCalledOnce();
    expect(result).toEqual(sampleReview);
  });

  it('wraps 409 ApiError with Ukrainian "already reviewed" message', async () => {
    vi.mocked(mockClient.post).mockRejectedValue(new ApiError('Conflict', 409));

    const { submitReview } = createReviewsMethods(mockClient);
    await expect(submitReview(42, 5, 'Great!')).rejects.toThrow('Ви вже залишили відгук');
  });

  it('rethrows non-409 errors', async () => {
    vi.mocked(mockClient.post).mockRejectedValue(new ApiError('Unauthorized', 401));

    const { submitReview } = createReviewsMethods(mockClient);
    await expect(submitReview(42, 5, 'Great!')).rejects.toThrow('Unauthorized');
  });
});

describe('updateReview', () => {
  it('updates rating and comment when both provided', async () => {
    vi.mocked(mockClient.put).mockResolvedValue(sampleReview);

    const { updateReview } = createReviewsMethods(mockClient);
    const result = await updateReview(1, 4, 'Оновлений відгук');

    expect(mockClient.put).toHaveBeenCalledWith(
      `${config.endpoints.reviews}/1`,
      { rating: 4, comment: 'Оновлений відгук' }
    );
    expect(mockClient.clearProductsCache).toHaveBeenCalledOnce();
    expect(result).toEqual(sampleReview);
  });

  it('updates only rating when comment is not provided', async () => {
    vi.mocked(mockClient.put).mockResolvedValue(sampleReview);

    const { updateReview } = createReviewsMethods(mockClient);
    await updateReview(1, 3);

    expect(mockClient.put).toHaveBeenCalledWith(
      `${config.endpoints.reviews}/1`,
      { rating: 3 }
    );
  });

  it('updates only comment when rating is not provided', async () => {
    vi.mocked(mockClient.put).mockResolvedValue(sampleReview);

    const { updateReview } = createReviewsMethods(mockClient);
    await updateReview(1, undefined, 'Новий коментар');

    expect(mockClient.put).toHaveBeenCalledWith(
      `${config.endpoints.reviews}/1`,
      { comment: 'Новий коментар' }
    );
  });

  it('updates with empty object when neither rating nor comment provided', async () => {
    vi.mocked(mockClient.put).mockResolvedValue(sampleReview);

    const { updateReview } = createReviewsMethods(mockClient);
    await updateReview(1);

    expect(mockClient.put).toHaveBeenCalledWith(`${config.endpoints.reviews}/1`, {});
  });
});

describe('deleteReview', () => {
  it('deletes the review and clears products cache', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue(undefined);

    const { deleteReview } = createReviewsMethods(mockClient);
    await deleteReview(1);

    expect(mockClient.delete).toHaveBeenCalledWith(`${config.endpoints.reviews}/1`);
    expect(mockClient.clearProductsCache).toHaveBeenCalledOnce();
  });
});
