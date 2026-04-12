/**
 * @fileoverview Admin analytics panel component.
 *
 * Left side: scrollable product selector (all products, including hidden).
 * Right side: date-filter controls, engagement stats cards, and product reviews.
 *
 * All data is fetched via {@link useAdminAnalytics}; this component is a
 * pure presenter.
 *
 * @module components/admin/AdminAnalyticsContent
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import type { DateRange as DayPickerDateRange } from 'react-day-picker';
import { useAdminAnalytics, type TimeFilter, type DateRange } from '@/hooks/useAdminAnalytics';
import { AnalyticsProduct, Review } from '@/types';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { iconPaths } from '../ui/icons/iconPaths';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

// ── Font helpers ──────────────────────────────────────────────────────────────

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold    = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Formats a Date as `DD.MM.YYYY` in Ukrainian locale.
 *
 * @param d - Date to format.
 * @returns Formatted date string.
 */
function formatDate(d: Date): string {
  return d.toLocaleDateString('uk-UA', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  });
}

/**
 * Derives two-letter initials from a full name.
 *
 * @param name - Full name, e.g. `"Яна Коваленко"`.
 * @returns Uppercase initials, e.g. `"ЯК"`.
 */
function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface ProductListItemProps {
  product: AnalyticsProduct;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * A single row in the analytics product selector list.
 *
 * Hidden products display a grey "прихований" badge to distinguish them from
 * visible ones without hiding the entry entirely.
 *
 * @param product    - Product data.
 * @param isSelected - Whether this row is currently selected.
 * @param onClick    - Callback fired when the row is clicked.
 */
function ProductListItem({ product, isSelected, onClick }: ProductListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'h-[40px] flex items-center px-[12px] cursor-pointer transition-all gap-[8px]',
        isSelected && 'bg-white border border-[#4d4d4d] rounded-[12px]',
      )}
    >
      <span
        className="text-[16px] text-[#0d0d0d] truncate flex-1"
        style={isSelected ? fontBold : fontRegular}
      >
        {product.title}
      </span>
      {product.hidden && (
        <span
          className="text-[11px] text-muted-foreground border border-[#ccc] rounded-[8px] px-3 py-0 shrink-0"
          style={fontRegular}
        >
          прихований
        </span>
      )}
    </div>
  );
}

interface StatCardProps {
  value: string;
  icon: ReactNode;
}

/**
 * A single engagement stat card (downloads, bookmarks, or views).
 *
 * @param value - Formatted number to display, or `"—"` while loading.
 * @param icon  - SVG icon element rendered next to the number.
 */
function StatCard({ value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-[16px] p-[20px] flex items-center gap-[12px] flex-1">
      <span className="text-[48px] text-[#0d0d0d]" style={fontBold}>
        {value}
      </span>
      {icon}
    </div>
  );
}

/**
 * A single user review card rendered inside the reviews list.
 *
 * @param review - Review data from the API.
 */
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white rounded-[16px] px-[24px] py-[20px] flex flex-col gap-[12px]">
      {/* Star rating */}
      <div className="flex gap-[2px]">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d={iconPaths.star}
              fill={star <= review.rating ? '#E9CF0C' : '#D9D9D9'}
            />
          </svg>
        ))}
      </div>
      {/* Review text */}
      <p className="text-[16px] leading-[28px] text-[#0d0d0d] m-0" style={fontRegular}>
        {review.comment}
      </p>
      {/* Author */}
      <div className="flex items-center gap-[12px]">
        <Avatar className="size-[48px] shrink-0">
          <AvatarImage src={review.userAvatar} alt={review.userName} className="object-cover" />
          <AvatarFallback
            className="bg-[#e6e6e6] text-[#4d4d4d] text-[16px]"
            style={fontBold}
          >
            {initials(review.userName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-[16px] text-[#0d0d0d]" style={fontBold}>
            {review.userName}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/** Props for {@link AdminAnalyticsContent}. */
interface AdminAnalyticsContentProps {
  /** Callback to navigate to another admin section. */
  onSectionChange: (section: string) => void;
}

/** Time filter label map. */
const FILTERS: { id: TimeFilter; label: string }[] = [
  { id: 'week',   label: 'Тиждень' },
  { id: 'month',  label: 'Місяць'  },
  { id: 'year',   label: 'Рік'     },
  { id: 'custom', label: 'Обрати'  },
];

/**
 * Admin analytics panel — product selector on the left, date-filtered
 * engagement stats and user reviews on the right.
 *
 * Data is managed by {@link useAdminAnalytics}; this component only renders.
 *
 * @param onSectionChange - Admin panel section navigation callback.
 *
 * @example
 * ```tsx
 * <AdminAnalyticsContent onSectionChange={setSection} />
 * ```
 */
export function AdminAnalyticsContent({ onSectionChange: _onSectionChange }: AdminAnalyticsContentProps) {
  const {
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
  } = useAdminAnalytics();

  // Controls whether the custom-range calendar popover is open
  const [calendarOpen, setCalendarOpen] = useState(false);

  const statsValue = (n: number | undefined) =>
    analyticsLoading ? '—' : String(n ?? 0);

  const customRangeLabel =
    customRange.from && customRange.to
      ? `${formatDate(customRange.from)} – ${formatDate(customRange.to)}`
      : 'Обрати діапазон / Select range';

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] flex flex-row p-[24px] gap-[12px] h-full"
      data-name="AdminAnalyticsContent"
    >
      {/* ── LEFT PANEL ── */}
      <div className="w-[440px] h-full flex flex-col shrink-0 gap-[12px]">
        <h2
          className="text-[20px] text-[#0d0d0d] m-0 mb-[12px]"
          style={fontBold}
        >
          Назва матеріалу
        </h2>

        <div className="flex-1 overflow-y-auto">
          {productsLoading && (
            <p className="text-[14px] text-[#4d4d4d] px-[12px]" style={fontRegular}>
              Завантаження...
            </p>
          )}
          {!productsLoading && products.length === 0 && (
            <p className="text-[14px] text-[#4d4d4d] px-[12px]" style={fontRegular}>
              Матеріалів ще немає / No products yet
            </p>
          )}
          {products.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              isSelected={selectedProductId === product.id}
              onClick={() => selectProduct(product.id)}
            />
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col gap-[28px] min-w-0">

        {/* Time filters */}
        <div className="flex flex-col gap-[12px]">
          <span className="text-[20px] text-[#0d0d0d]" style={fontRegular}>
            Фільтри за часом
          </span>

          <div className="flex flex-row gap-[8px]">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                className={cn(
                  'flex-1 h-[40px] rounded-[16px] cursor-pointer text-[16px] transition-all border',
                  timeFilter === filter.id
                    ? 'bg-[#5e89e8] text-white border-[#5e89e8]'
                    : 'bg-transparent text-[#4d4d4d] border-[#5e89e8]',
                )}
                style={timeFilter === filter.id ? fontBold : fontRegular}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Custom date range picker — only visible when "Обрати" is active */}
          {timeFilter === 'custom' && (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'h-[40px] px-[16px] rounded-[16px] border border-[#5e89e8] text-[14px] cursor-pointer transition-all self-start',
                    customRange.from && customRange.to
                      ? 'text-[#0d0d0d] bg-white'
                      : 'text-[#4d4d4d] bg-transparent',
                  )}
                  style={fontRegular}
                >
                  {customRangeLabel}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white shadow-lg" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: customRange.from,
                    to:   customRange.to,
                  } as DayPickerDateRange}
                  onSelect={(range: DayPickerDateRange | undefined) => {
                    const next: DateRange = {
                      from: range?.from,
                      to:   range?.to,
                    };
                    setCustomRange(next);
                    // Close popover once both bounds are chosen
                    if (next.from && next.to) {
                      setCalendarOpen(false);
                    }
                  }}
                  toDate={new Date()}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Statistics cards */}
        <div className="flex flex-wrap gap-[16px]">
          <StatCard
            value={statsValue(analytics?.purchases)}
            icon={
              <svg width="28" height="28" viewBox="0 0 18.6667 18.6667" fill="none">
                <path d={iconPaths.downloadAdmin} fill="#5E89E8" />
              </svg>
            }
          />
          <StatCard
            value={statsValue(analytics?.saves)}
            icon={
              <svg width="28" height="28" viewBox="0 0 18.6667 23.3333" fill="none">
                <path d={iconPaths.bookmarkAdmin} fill="#5E89E8" />
              </svg>
            }
          />
          <StatCard
            value={statsValue(analytics?.views)}
            icon={
              <svg width="28" height="28" viewBox="0 0 25.6667 17.5" fill="none">
                <path d={iconPaths.eye} fill="#4D4D4D" />
              </svg>
            }
          />
        </div>

        {/* Reviews section */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-[12px]">
          {reviewsLoading && (
            <p className="text-[14px] text-[#4d4d4d]" style={fontRegular}>
              Завантаження відгуків...
            </p>
          )}
          {!reviewsLoading && reviews.length === 0 && (
            <p className="text-[14px] text-[#4d4d4d]" style={fontRegular}>
              {/* Note: the public reviews endpoint filters by product_hidden = false,
                  so hidden products will show no reviews here.
                  A dedicated admin reviews endpoint can be added in a future iteration. */}
              Відгуків ще немає / No reviews yet
            </p>
          )}
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}
