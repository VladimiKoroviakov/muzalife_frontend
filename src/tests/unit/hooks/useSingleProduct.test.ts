/**
 * @fileoverview Unit tests for the {@link useSingleProduct} hook.
 *
 * Covers product + review fetching, gallery deduplication, the
 * "review failure never blocks the product page" rule, and refetch.
 *
 * @module tests/unit/hooks/useSingleProduct
 */

// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSingleProduct } from '@/hooks/useSingleProduct';
import { apiService } from '@/services/api';

vi.mock('@/services/api', () => ({
  apiService: {
    getProductById: vi.fn(),
    getReviewsByProductId: vi.fn(),
  },
}));

const mockGetProductById = vi.mocked(apiService.getProductById);
const mockGetReviewsByProductId = vi.mocked(apiService.getReviewsByProductId);

const fakeProduct = {
  id: 7,
  title: 'Квест у лісі',
  price: 150,
  rating: 4.8,
  type: 'Квест' as const,
  image: 'https://cdn.muzalife.com/main.jpg',
  ageCategory: ['6–12'],
  events: ['День народження'],
  description: 'Захоплюючий квест для дітей.',
  createdAt: '2025-03-01T00:00:00.000Z',
  updatedAt: '2025-03-01T00:00:00.000Z',
  additionalImages: ['https://cdn.muzalife.com/extra1.jpg', 'https://cdn.muzalife.com/extra2.jpg'],
  additionalImageIds: [101, 102],
};

const fakeReviews = [
  {
    id: 1,
    product_id: 7,
    user_id: 99,
    rating: 5,
    text: 'Чудово!',
    created_at: '2025-04-01T00:00:00.000Z',
    user_name: 'Аліна',
    user_avatar: null,
  },
];

beforeEach(() => {
  vi.resetAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// undefined id
// ─────────────────────────────────────────────────────────────────────────────
describe('useSingleProduct — undefined id', () => {
  it('sets an error immediately without calling the API when id is undefined', async () => {
    const { result } = renderHook(() => useSingleProduct(undefined));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeTruthy();
    expect(result.current.product).toBeNull();
    expect(mockGetProductById).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Success path
// ─────────────────────────────────────────────────────────────────────────────
describe('useSingleProduct — success', () => {
  it('fetches product and reviews and exposes them in state', async () => {
    mockGetProductById.mockResolvedValueOnce(fakeProduct);
    mockGetReviewsByProductId.mockResolvedValueOnce(fakeReviews);

    const { result } = renderHook(() => useSingleProduct('7'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.product?.id).toBe(7);
    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('deduplicates gallery images (main image should not repeat in additionalImages)', async () => {
    const productWithDupe = {
      ...fakeProduct,
      // main image also appears first in additionalImages
      additionalImages: [
        'https://cdn.muzalife.com/main.jpg',
        'https://cdn.muzalife.com/extra1.jpg',
      ],
    };
    mockGetProductById.mockResolvedValueOnce(productWithDupe);
    mockGetReviewsByProductId.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSingleProduct('7'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // main.jpg must appear exactly once
    const count = result.current.galleryImages.filter(
      (img) => img === 'https://cdn.muzalife.com/main.jpg'
    ).length;
    expect(count).toBe(1);
    expect(result.current.galleryImages).toHaveLength(2); // main + extra1
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Review fetch failure does not block the product page
// ─────────────────────────────────────────────────────────────────────────────
describe('useSingleProduct — review fetch failure', () => {
  it('leaves error null and reviews empty when getReviewsByProductId rejects', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetProductById.mockResolvedValueOnce(fakeProduct);
    mockGetReviewsByProductId.mockRejectedValueOnce(new Error('Reviews unavailable'));

    const { result } = renderHook(() => useSingleProduct('7'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.product?.id).toBe(7);
    expect(result.current.reviews).toEqual([]);
    consoleSpy.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// refetch
// ─────────────────────────────────────────────────────────────────────────────
describe('useSingleProduct — refetch', () => {
  it('calls getProductById a second time when refetch is invoked', async () => {
    mockGetProductById.mockResolvedValue(fakeProduct);
    mockGetReviewsByProductId.mockResolvedValue([]);

    const { result } = renderHook(() => useSingleProduct('7'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockGetProductById).toHaveBeenCalledTimes(2);
  });
});
