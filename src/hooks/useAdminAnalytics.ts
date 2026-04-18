/**
 * @fileoverview React hook for the admin analytics panel.
 *
 * Manages the analytics product list, the selected product, the active
 * date-window filter, engagement stats, and per-product reviews so that
 * `AdminAnalyticsContent` remains a pure presenter.
 *
 * @module hooks/useAdminAnalytics
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiService } from '../services/api';
import { AnalyticsProduct, ProductAnalytics, Review } from '../types';

/** The four time-window presets available in the analytics filter bar. */
export type TimeFilter = 'week' | 'month' | 'year' | 'custom';

/** A date range used with the custom calendar picker. */
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

/** Return shape of {@link useAdminAnalytics}. */
export interface UseAdminAnalyticsReturn {
  /** Full product list including hidden/soft-deleted products. */
  products: AnalyticsProduct[];
  /** `true` while the product list is loading. */
  productsLoading: boolean;
  /** ID of the currently selected product, or `null` before the list loads. */
  selectedProductId: number | null;
  /**
   * Sets the active product and triggers a stats + reviews reload.
   *
   * @param id - Product ID to select.
   */
  selectProduct: (id: number) => void;
  /** Active time-window preset. */
  timeFilter: TimeFilter;
  /**
   * Switches the active preset and triggers a stats reload.
   *
   * @param f - New preset to activate.
   */
  setTimeFilter: (f: TimeFilter) => void;
  /** Custom date range; only used when `timeFilter === 'custom'`. */
  customRange: DateRange;
  /**
   * Updates the custom date range. Automatically switches `timeFilter` to
   * `'custom'` so the stats reload picks up the new bounds.
   *
   * @param range - New date range.
   */
  setCustomRange: (range: DateRange) => void;
  /** Engagement stats for the selected product in the current window. */
  analytics: ProductAnalytics | null;
  /** `true` while stats are loading. */
  analyticsLoading: boolean;
  /** Reviews for the selected product (not date-filtered). */
  reviews: Review[];
  /** `true` while reviews are loading. */
  reviewsLoading: boolean;
}

/** Maps preset ids to the corresponding time window. */
const PRESET_RANGES: Record<
  Exclude<TimeFilter, 'custom'>,
  () => { from: Date; to: Date }
> = {
  week:  () => { const to = new Date(); const from = new Date(to.getTime() - 7   * 86_400_000); return { from, to }; },
  month: () => { const to = new Date(); const from = new Date(to.getTime() - 30  * 86_400_000); return { from, to }; },
  year:  () => { const to = new Date(); const from = new Date(to.getTime() - 365 * 86_400_000); return { from, to }; },
};

/**
 * Provides all data and actions for the admin analytics panel.
 *
 * - Fetches the product list (including hidden products) on mount.
 * - Re-fetches engagement stats whenever the selected product or date window changes.
 * - Re-fetches reviews whenever the selected product changes.
 *
 * @returns Analytics state and action callbacks.
 *
 * @example
 * ```tsx
 * function AdminAnalyticsContent() {
 *   const { products, selectedProductId, selectProduct, analytics } = useAdminAnalytics();
 *   return (
 *     <div>
 *       {products.map(p => (
 *         <button key={p.id} onClick={() => selectProduct(p.id)}>{p.title}</button>
 *       ))}
 *       <p>Views: {analytics?.views ?? 0}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAdminAnalytics = (): UseAdminAnalyticsReturn => {
  const [products, setProducts]                     = useState<AnalyticsProduct[]>([]);
  const [productsLoading, setProductsLoading]       = useState(true);
  const [selectedProductId, setSelectedProductId]   = useState<number | null>(null);
  const [timeFilter, setTimeFilterState]            = useState<TimeFilter>('month');
  const [customRange, setCustomRangeState]          = useState<DateRange>({ from: undefined, to: undefined });
  const [analytics, setAnalytics]                   = useState<ProductAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading]     = useState(false);
  const [reviews, setReviews]                       = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading]         = useState(false);

  // ── Load product list on mount ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setProductsLoading(true);
        const data = await apiService.getAnalyticsProducts();
        setProducts(data);
        if (data.length > 0) {
          setSelectedProductId(data[0].id);
        }
      } catch {
        toast.error('Не вдалося завантажити список матеріалів / Failed to load product list');
      } finally {
        setProductsLoading(false);
      }
    };
    load();
  }, []);

  // ── Reload stats when selected product or date window changes ──────────────
  useEffect(() => {
    if (selectedProductId === null) {return;}

    let timeFrom: string;
    let timeTo: string;

    if (timeFilter === 'custom') {
      if (!customRange.from || !customRange.to) {return;}
      timeFrom = customRange.from.toISOString();
      const toEndOfDay = new Date(customRange.to);
      toEndOfDay.setHours(23, 59, 59, 999);
      timeTo = toEndOfDay.toISOString();
    } else {
      const range = PRESET_RANGES[timeFilter]();
      timeFrom = range.from.toISOString();
      timeTo   = range.to.toISOString();
    }

    const fetchStats = async () => {
      try {
        setAnalyticsLoading(true);
        const data = await apiService.getProductAnalytics(selectedProductId, timeFrom, timeTo);
        setAnalytics(data);
      } catch {
        toast.error('Не вдалося завантажити аналітику / Failed to load analytics');
        setAnalytics(null);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchStats();
  }, [selectedProductId, timeFilter, customRange]);

  // ── Reload reviews when selected product changes ────────────────────────────
  useEffect(() => {
    if (selectedProductId === null) {return;}

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const data = await apiService.getReviewsByProductId(selectedProductId);
        setReviews(data);
      } catch {
        toast.error('Не вдалося завантажити відгуки / Failed to load reviews');
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [selectedProductId]);

  const selectProduct = useCallback((id: number) => {
    setSelectedProductId(id);
  }, []);

  const setTimeFilter = useCallback((f: TimeFilter) => {
    setTimeFilterState(f);
  }, []);

  const setCustomRange = useCallback((range: DateRange) => {
    setCustomRangeState(range);
    setTimeFilterState('custom');
  }, []);

  return {
    products,
    productsLoading,
    selectedProductId,
    selectProduct,
    timeFilter,
    setTimeFilter,
    customRange,
    setCustomRange,
    analytics,
    analyticsLoading,
    reviews,
    reviewsLoading,
  };
};
