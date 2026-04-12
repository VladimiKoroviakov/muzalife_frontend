/**
 * @fileoverview Admin detail view for a single personal order.
 *
 * Fetches the order by ID, displays all fields, and presents status-conditional
 * action controls aligned with the personal orders state machine (spec §5).
 *
 * When a `pending` order is opened the component silently transitions it to
 * `in_review` so that "taking for review" happens implicitly on navigation,
 * removing the superfluous intermediate button step.
 *
 * @module components/admin/AdminOrderDetail
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';
import { ORDER_STATUS_LABELS_ADMIN, ORDER_STATUS_COLORS } from '@/constants/api';
import type { PersonalOrder } from '@/types';

interface AdminOrderDetailProps {
  /**
   * ID of the order to display, as a string (from URL / navigation state).
   */
  orderId: string | null;
  /**
   * Navigate to a named admin section.
   */
  onSectionChange: (section: string) => void;
}

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };

const inputClass = cn(
  'h-[52px] w-full rounded-[12px] border border-[#b3b3b3] bg-white px-[16px]',
  'text-[16px] text-[#0d0d0d] outline-none focus:border-[#5e89e8] transition-colors'
);

function formatDate(iso: string | null | undefined): string {
  if (!iso) { return '—'; }
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) { return '—'; }
  const n = Number(price);
  if (isNaN(n)) { return '—'; }
  return `${n.toFixed(2)} грн`;
}

/**
 * Admin detail panel for a personal order, with status-driven action controls.
 *
 * Supported transitions per spec §5:
 * - `pending` → `in_review` (auto, on mount)
 * - `in_review` → accepted (price required) | declined (reason required)
 * - `paid` → in_development
 * - `in_development` → done (v1: direct status override; file upload TBD)
 *
 * @param props.orderId - String order ID to load.
 * @param props.onSectionChange - Navigate back to the orders list on completion.
 * @returns The admin order detail panel.
 * @example
 * ```tsx
 * <AdminOrderDetail orderId="42" onSectionChange={(s) => setSection(s)} />
 * ```
 */
export function AdminOrderDetail({ orderId, onSectionChange }: AdminOrderDetailProps) {
  const [order, setOrder] = useState<PersonalOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accept form state — always visible when in_review
  const [priceInput, setPriceInput] = useState('');
  const [deadlineOverride, setDeadlineOverride] = useState('');

  // Decline form state
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        let data = await apiService.adminGetPersonalOrderById(Number(orderId));

        // Auto-transition: opening a pending order is the act of taking it for review
        if (data.order_status === 'pending') {
          try {
            data = await apiService.adminUpdatePersonalOrder(Number(orderId), { orderStatus: 'in_review' });
          } catch {
            // Non-fatal — show the order as-is if the transition fails
          }
        }

        setOrder(data);
        if (data.order_deadline) {
          setDeadlineOverride(data.order_deadline.slice(0, 10));
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Не вдалося завантажити замовлення';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const handleTransition = async (updateData: Record<string, unknown>) => {
    if (!orderId) { return; }
    setIsSubmitting(true);
    try {
      await apiService.adminUpdatePersonalOrder(Number(orderId), updateData as Parameters<typeof apiService.adminUpdatePersonalOrder>[1]);
      toast.success('Замовлення оновлено');
      onSectionChange('orders');
    } catch (err: unknown) {
      const isConflict = err instanceof Error && err.message.toLowerCase().includes('conflict');
      if (isConflict) {
        toast.error('Замовлення вже змінено. Оновіть сторінку.');
      } else {
        const msg = err instanceof Error ? err.message : 'Помилка при оновленні замовлення';
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccept = () => {
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) {
      toast.error('Введіть коректну ціну');
      return;
    }
    handleTransition({
      orderStatus: 'accepted',
      orderPrice: price,
      ...(deadlineOverride ? { orderDeadline: deadlineOverride } : {}),
    });
  };

  const handleDecline = () => {
    if (!declineReason.trim()) {
      toast.error('Введіть причину відхилення');
      return;
    }
    handleTransition({ orderStatus: 'declined', orderDeclineReason: declineReason.trim() });
  };

  const handleStartWork = () =>
    handleTransition({ orderStatus: 'in_development' });

  const handleFinish = () =>
    handleTransition({ orderStatus: 'done' });

  // ── States ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0 flex items-center justify-center">
        <p className="text-[16px] text-[#4d4d4d]" style={fontRegular}>Завантаження...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0 flex flex-col items-center justify-center gap-[12px]">
        <p className="text-[16px] text-[#cc0000]" style={fontRegular}>{error ?? 'Замовлення не знайдено'}</p>
        <button
          onClick={() => onSectionChange('orders')}
          className="px-[24px] py-[10px] rounded-[12px] bg-white border border-[#4d4d4d] text-[16px] cursor-pointer hover:bg-[#e6e6e6] transition-colors"
          style={fontRegular}
        >
          Назад
        </button>
      </div>
    );
  }

  const status = order.order_status;
  const statusLabel = ORDER_STATUS_LABELS_ADMIN[status] ?? status;
  const statusColor = ORDER_STATUS_COLORS[status] ?? '#4d4d4d';

  return (
    <div
      className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0 overflow-auto"
      data-name="AdminOrderDetail"
    >
      <div className="box-border flex flex-col gap-[20px] p-[24px] h-full">
      {/* Header */}
      <div className="flex items-start gap-[16px] shrink-0">
        <h1
          className="text-[28px] text-[#0d0d0d] m-0 flex-1 min-w-0"
          style={fontBold}
        >
          {order.order_title}
        </h1>
        <span
          className="shrink-0 text-[13px] px-[12px] py-[6px] rounded-[8px]"
          style={{ color: statusColor, backgroundColor: `${statusColor}18`, ...fontBold }}
        >
          {statusLabel}
        </span>
      </div>

      {/* User info */}
      {(order.user_name || order.user_email) && (
        <div className="shrink-0">
          <p className="text-[13px] text-[#4d4d4d] m-0" style={fontRegular}>
            Замовник: <strong style={fontBold}>{order.user_name ?? order.user_email}</strong>
            {order.user_name && order.user_email && (
              <span className="text-[#4d4d4d]"> ({order.user_email})</span>
            )}
          </p>
        </div>
      )}

      {/* Decline reason */}
      {status === 'declined' && order.order_decline_reason && (
        <div className="rounded-[12px] border border-[#cc0000] bg-[#cc000010] p-[16px] shrink-0">
          <p className="text-[13px] text-[#cc0000] m-0 mb-[4px]" style={fontBold}>Причина відхилення</p>
          <p className="text-[16px] text-[#0d0d0d] m-0" style={fontRegular}>{order.order_decline_reason}</p>
        </div>
      )}

      {/* In-development info */}
      {status === 'in_development' && (
        <div className="rounded-[12px] border border-[#0066cc] bg-[#0066cc10] p-[16px] shrink-0">
          <p className="text-[14px] text-[#0066cc] m-0" style={fontRegular}>
            Замовлення в розробці. Завантаження файлів буде доступне у наступній версії.
          </p>
        </div>
      )}

      {/* Fields grid */}
      <div className="grid grid-cols-2 gap-x-[24px] gap-y-[16px] shrink-0">

        {/* Тип матеріалу — read-only plain text */}
        <div>
          <p className="text-[13px] text-[#4d4d4d] m-0 mb-[6px]" style={fontRegular}>Тип матеріалу</p>
          <p className="text-[16px] text-[#0d0d0d] m-0" style={fontRegular}>
            {order.order_material_type || '—'}
          </p>
        </div>

        {/* Вікова група — read-only plain text */}
        <div>
          <p className="text-[13px] text-[#4d4d4d] m-0 mb-[6px]" style={fontRegular}>Вікова група</p>
          <p className="text-[16px] text-[#0d0d0d] m-0" style={fontRegular}>
            {order.order_material_age_category || '—'}
          </p>
        </div>

        {/* Price — editable when in_review, read-only otherwise */}
        <div>
          <label className="block text-[13px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>
            Ціна {status === 'in_review' && <span className="text-[#cc0000]">*</span>}
          </label>
          {status === 'in_review' ? (
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Вкажіть ціну"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className={inputClass}
              style={fontRegular}
              disabled={isSubmitting}
            />
          ) : (
            <p className="text-[16px] text-[#0d0d0d] m-0" style={fontRegular}>
              {formatPrice(order.order_price)}
            </p>
          )}
        </div>

        {/* Deadline — editable when in_review, read-only otherwise */}
        <div>
          <label className="block text-[13px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>
            Дедлайн {status === 'in_review' && <span className="text-[#4d4d4d] text-[11px]">(необов&apos;язково — змінити)</span>}
          </label>
          {status === 'in_review' ? (
            <input
              type="date"
              value={deadlineOverride}
              onChange={(e) => setDeadlineOverride(e.target.value)}
              className={inputClass}
              style={fontRegular}
              disabled={isSubmitting}
            />
          ) : (
            <p className="text-[16px] text-[#0d0d0d] m-0" style={fontRegular}>
              {formatDate(order.order_deadline)}
            </p>
          )}
        </div>

        {/* Дата замовлення — read-only plain text */}
        <div>
          <p className="text-[13px] text-[#4d4d4d] m-0 mb-[6px]" style={fontRegular}>Дата замовлення</p>
          <p className="text-[16px] text-[#0d0d0d] m-0" style={fontRegular}>
            {formatDate(order.order_created_at)}
          </p>
        </div>
      </div>

      {/* Description — read-only plain text */}
      <div className="flex-1 flex flex-col min-h-[120px]">
        <p className="text-[13px] text-[#4d4d4d] m-0 mb-[6px]" style={fontRegular}>Опис замовлення</p>
        <p className="text-[16px] text-[#0d0d0d] m-0 leading-[24px] whitespace-pre-wrap flex-1" style={fontRegular}>
          {order.order_description}
        </p>
      </div>

      {/* Decline form */}
      {showDeclineForm && (
        <div className="shrink-0 flex flex-col gap-[8px]">
          <label className="text-[13px] text-[#4d4d4d]" style={fontRegular}>
            Причина відхилення <span className="text-[#cc0000]">*</span>
          </label>
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Поясніть причину відхилення замовлення..."
            rows={3}
            className={cn(
              'w-full rounded-[12px] border border-[#b3b3b3] bg-white px-[16px] py-[12px]',
              'text-[16px] text-[#0d0d0d] outline-none focus:border-[#cc0000] transition-colors resize-none'
            )}
            style={fontRegular}
            disabled={isSubmitting}
          />
        </div>
      )}

      {/* Accepted: waiting info */}
      {status === 'accepted' && (
        <div className="rounded-[12px] border border-[#ff7b00] bg-[#ff7b0010] p-[16px] shrink-0">
          <p className="text-[14px] text-[#ff7b00] m-0" style={fontBold}>Очікує підтвердження від клієнта</p>
          <p className="text-[13px] text-[#4d4d4d] m-0 mt-[4px]" style={fontRegular}>
            Клієнт має 72 години для підтвердження. Після спливання терміну замовлення буде автоматично відхилено.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-[12px] items-center justify-end shrink-0">

        {/* in_review → accept or decline */}
        {status === 'in_review' && !showDeclineForm && (
          <>
            <button
              onClick={() => setShowDeclineForm(true)}
              disabled={isSubmitting}
              className="h-[44px] px-[24px] rounded-[12px] border-none bg-transparent text-[16px] text-[#cc0000] underline cursor-pointer hover:opacity-70 transition-opacity disabled:opacity-50"
              style={fontRegular}
            >
              Відхилити замовлення
            </button>
            <button
              onClick={handleAccept}
              disabled={isSubmitting}
              className="h-[44px] px-[24px] rounded-[12px] bg-[#5e89e8] text-[16px] text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
              style={fontBold}
            >
              {isSubmitting ? 'Обробка...' : 'Прийняти замовлення'}
            </button>
          </>
        )}

        {/* in_review decline confirmation */}
        {status === 'in_review' && showDeclineForm && (
          <>
            <button
              onClick={() => { setShowDeclineForm(false); setDeclineReason(''); }}
              disabled={isSubmitting}
              className="h-[44px] px-[24px] rounded-[12px] border border-[#4d4d4d] bg-white text-[16px] text-[#4d4d4d] cursor-pointer hover:bg-[#e6e6e6] transition-colors disabled:opacity-50"
              style={fontRegular}
            >
              Скасувати
            </button>
            <button
              onClick={handleDecline}
              disabled={isSubmitting}
              className="h-[44px] px-[24px] rounded-[12px] bg-[#cc0000] text-[16px] text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
              style={fontBold}
            >
              {isSubmitting ? 'Обробка...' : 'Підтвердити відхилення'}
            </button>
          </>
        )}

        {/* paid → in_development */}
        {status === 'paid' && (
          <button
            onClick={handleStartWork}
            disabled={isSubmitting}
            className="h-[44px] px-[24px] rounded-[12px] bg-[#5e89e8] text-[16px] text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
            style={fontBold}
          >
            {isSubmitting ? 'Обробка...' : 'Розпочати роботу'}
          </button>
        )}

        {/* in_development → done (v1 workaround — no file upload yet) */}
        {status === 'in_development' && (
          <button
            onClick={handleFinish}
            disabled={isSubmitting}
            className="h-[44px] px-[24px] rounded-[12px] bg-[#5e89e8] text-[16px] text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
            style={fontBold}
          >
            {isSubmitting ? 'Обробка...' : 'Завершити замовлення'}
          </button>
        )}
      </div>
      </div>
    </div>
  );
}
