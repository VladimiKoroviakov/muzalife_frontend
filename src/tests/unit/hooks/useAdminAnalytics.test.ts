/**
 * @fileoverview Unit tests for the {@link useAdminAnalytics} hook.
 *
 * Covers product-list loading, auto-selection, stats/reviews fetching,
 * and filter actions in the admin analytics panel.
 *
 * QA Test Cases: TC_2.8.x — Analytics module (R1.9).
 *
 * @module tests/unit/hooks/useAdminAnalytics
 */

// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import { apiService } from '@/services/api';

vi.mock('@/services/api', () => ({
  apiService: {
    getAnalyticsProducts: vi.fn(),
    getProductAnalytics: vi.fn(),
    getReviewsByProductId: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

import { toast } from 'sonner';

const mockGetProducts = vi.mocked(apiService.getAnalyticsProducts);
const mockGetAnalytics = vi.mocked(apiService.getProductAnalytics);
const mockGetReviews = vi.mocked(apiService.getReviewsByProductId);
const mockToastError = vi.mocked(toast.error);

const sampleProducts = [
  { id: 1, title: 'Сценарій 1', hidden: false },
  { id: 2, title: 'Сценарій 2', hidden: true },
];

const sampleAnalytics = {
  productId: 1,
  timeFrom: '2025-01-01T00:00:00.000Z',
  timeTo: '2025-01-31T23:59:59.999Z',
  views: 150,
  purchases: 12,
  saves: 30,
  averageRating: 4.6,
  reviewCount: 8,
  revenue: 1800,
};

const sampleReviews = [
  {
    id: 1,
    productId: 1,
    userId: 5,
    userName: 'Анна',
    userAvatar: undefined,
    rating: 5,
    comment: 'Чудово!',
    createdAt: '2025-01-15T10:00:00.000Z',
  },
];

beforeEach(() => {
  vi.resetAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// Mount — product list
// ─────────────────────────────────────────────────────────────────────────────
describe('useAdminAnalytics — initial product list load', () => {
  it('productsLoading starts as true and products is empty', () => {
    mockGetProducts.mockResolvedValueOnce(sampleProducts);
    mockGetAnalytics.mockResolvedValue(sampleAnalytics);
    mockGetReviews.mockResolvedValue(sampleReviews);

    const { result } = renderHook(() => useAdminAnalytics());
    expect(result.current.productsLoading).toBe(true);
    expect(result.current.products).toEqual([]);
  });

  it('loads product list and sets productsLoading to false', async () => {
    mockGetProducts.mockResolvedValueOnce(sampleProducts);
    mockGetAnalytics.mockResolvedValue(sampleAnalytics);
    mockGetReviews.mockResolvedValue(sampleReviews);

    const { result } = renderHook(() => useAdminAnalytics());
    await waitFor(() => expect(result.current.productsLoading).toBe(false));

    expect(result.current.products).toEqual(sampleProducts);
  });

  it('auto-selects the first product once the list loads', async () => {
    mockGetProducts.mockResolvedValueOnce(sampleProducts);
    mockGetAnalytics.mockResolvedValue(sampleAnalytics);
    mockGetReviews.mockResolvedValue(sampleReviews);

    const { result } = renderHook(() => useAdminAnalytics());
    await waitFor(() => expect(result.current.productsLoading).toBe(false));

    expect(result.current.selectedProductId).toBe(1);
  });

  it('selectedProductId remains null when product list is empty', async () => {
    mockGetProducts.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAdminAnalytics());
    await waitFor(() => expect(result.current.productsLoading).toBe(false));

    expect(result.current.selectedProductId).toBeNull();
  });

  it('shows toast.error and keeps products empty when fetch fails', async () => {
    mockGetProducts.mockRejectedValueOnce(new Error('Forbidden'));

    const { result } = renderHook(() => useAdminAnalytics());
    await waitFor(() => expect(result.current.productsLoading).toBe(false));

    expect(result.current.products).toEqual([]);
    expect(mockToastError).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Analytics & reviews fetching
// ─────────────────────────────────────────────────────────────────────────────
describe('useAdminAnalytics — analytics and reviews', () => {
  it('fetches analytics for the auto-selected product on mount', async () => {
    mockGetProducts.mockResolvedValueOnce(sampleProducts);
    mockGetAnalytics.mockResolvedValue(sampleAnalytics);
    mockGetReviews.mockResolvedValue(sampleReviews);

    const { result } = renderHook(() => useAdminAnalytics());
    await waitFor(() => expect(result.current.analytics).toEqual(sampleAnalytics));

    expect(mockGetAnalytics).toHaveBeenCalledWith(
      1,
      expect.any(String),
      expect.any(String),
    );
  });

  it('fetches reviews for the auto-selected product on mount', async () => {
    mockGetProducts.mockResolvedValueOnce(sampleProducts);
    mockGetAnalytics.mockResolvedValue(sampleAnalytics);
    mockGetReviews.mockResolvedValue(sampleReviews);

    const { result } = renderHook(() => useAdminAnalytics());
    await waitFor(() => expect(result.current.reviewsLoading).toBe(false));

    expect(mockGetReviews).toHaveBeenCalledWith(1);
    expect(result.current.reviews).toEqual(sampleReviews);
  });

  it('shows toast.error and sets analytics to null when analytics fetch fails', async () => {
    mockGetProducts.mockResolvedValueOnce(sampleProducts);
    mockGetAnalytics.mockRejectedValue(new Error('Server error'));
    mockGetReviews.mockResolvedValue([]);

    const { result } = renderHook(() => useAdminAnalytics());
    await waitFor(() => expect(result.current.analyticsLoading).toBe(false));

    expect(result.current.analytics).toBeNull();
    expect(mockToastError).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// selectProduct
// ─────────────────────────────────────────────────────────────────────────────
describe('useAdminAnalytics — selectProduct', () => {
  it('updates selectedProductId when selectProduct is called', async () => {
    mockGetProducts.mockResolvedValueOnce(sampleProducts);
    mockGetAnalytics.mockResolvedValue(sampleAnalytics);
    mockGetReviews.mockResolvedValue(sampleReviews);

    const { result } = renderHook(() => useAdminAnalytics());
    await waitFor(() => expect(result.current.productsLoading).toBe(false));

    act(() => result.current.selectProduct(2));
    expect(result.current.selectedProductId).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setTimeFilter / setCustomRange
// ─────────────────────────────────────────────────────────────────────────────
describe('useAdminAnalytics — timeFilter and customRange', () => {
  it('default timeFilter is "month"', async () => {
    mockGetProducts.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAdminAnalytics());
    await waitFor(() => expect(result.current.productsLoading).toBe(false));

    expect(result.current.timeFilter).toBe('month');
  });

  it('setTimeFilter updates the active preset', async () => {
    mockGetProducts.mockResolvedValueOnce(sampleProducts);
    mockGetAnalytics.mockResolvedValue(sampleAnalytics);
    mockGetReviews.mockResolvedValue([]);

    const { result } = renderHook(() => useAdminAnalytics());
    await waitFor(() => expect(result.current.productsLoading).toBe(false));

    act(() => result.current.setTimeFilter('week'));
    expect(result.current.timeFilter).toBe('week');
  });

  it('setCustomRange updates customRange AND switches timeFilter to "custom"', async () => {
    mockGetProducts.mockResolvedValueOnce(sampleProducts);
    mockGetAnalytics.mockResolvedValue(sampleAnalytics);
    mockGetReviews.mockResolvedValue([]);

    const { result } = renderHook(() => useAdminAnalytics());
    await waitFor(() => expect(result.current.productsLoading).toBe(false));

    const from = new Date('2026-01-01');
    const to = new Date('2026-01-31');
    act(() => result.current.setCustomRange({ from, to }));

    expect(result.current.customRange).toEqual({ from, to });
    expect(result.current.timeFilter).toBe('custom');
  });
});
