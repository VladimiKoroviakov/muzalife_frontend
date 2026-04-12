/**
 * @fileoverview User-side detail view for a single personal order.
 *
 * Renders order fields with status-conditional actions: edit and delete while
 * pending, confirm or decline when accepted, decline reason when declined, and
 * a placeholder when done (file delivery TBD).
 *
 * @module components/cabinet/PersonalOrderDetails
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';
import { submitLiqPayForm } from '@/lib/liqpay';
import { CacheManager } from '@/utils/cache-manager';
import config from '@/config';
import { ORDER_STATUS_LABELS_USER, ORDER_STATUS_COLORS } from '@/constants/api';
import { iconPaths } from '../ui/icons/iconPaths';
import type { PersonalOrder, ProductTypeLookup, AgeCategoryLookup } from '@/types';

const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };
const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };

const fieldClass = cn(
  'bg-[#f2f2f2] h-[52px] relative rounded-[12px] flex items-center px-[16px]',
  'text-[16px] text-[#0d0d0d] w-full'
);

const inputClass = cn(
  'h-[52px] w-full rounded-[12px] border border-[#b3b3b3] bg-white px-[16px]',
  'text-[16px] text-[#0d0d0d] outline-none focus:border-[#5e89e8] transition-colors'
);

const selectClass = cn(
  'h-[52px] w-full rounded-[12px] border border-[#b3b3b3] bg-white px-[16px]',
  'text-[16px] text-[#0d0d0d] outline-none focus:border-[#5e89e8] transition-colors',
  'appearance-none cursor-pointer'
);

function formatDate(dateString: string | null): string {
  if (!dateString) { return '—'; }
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateString;
  }
}

function formatPrice(price: number | null): string {
  if (price === null || price === undefined) { return '—'; }
  return `${Number(price).toFixed(2)} грн`;
}

function clearOrdersCache() {
  CacheManager.removeItem(config.cacheKeys.PERSONAL_ORDERS);
  CacheManager.removeItem(config.cacheKeys.PERSONAL_ORDERS_TIMESTAMP);
}

interface PersonalOrderDetailsProps {
  /**
   * ID of the order to display.
   */
  orderId: number;
  /**
   * Called when the user navigates back without changes.
   */
  onBack: () => void;
  /**
   * Called after a status-changing action (confirm, decline, delete) completes.
   */
  onOrderUpdated: () => void;
}

/**
 * Detail panel for a user's personal order.
 *
 * Shows all order fields and exposes status-conditional action buttons per
 * personal orders spec §7 and the user-side transition rules in §5.
 *
 * @param props.orderId - Order to load and display.
 * @param props.onBack - Navigate back to the orders list.
 * @param props.onOrderUpdated - Navigate back after a mutating action.
 * @returns The order detail panel.
 * @example
 * ```tsx
 * <PersonalOrderDetails orderId={42} onBack={() => setSection('orders')} onOrderUpdated={() => setSection('orders')} />
 * ```
 */
export function PersonalOrderDetails({ orderId, onBack, onOrderUpdated }: PersonalOrderDetailsProps) {
  const [order, setOrder] = useState<PersonalOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editTypeId, setEditTypeId] = useState<number | null>(null);
  const [editAgeCategoryId, setEditAgeCategoryId] = useState<number | null>(null);

  // Metadata for edit dropdowns
  const [types, setTypes] = useState<ProductTypeLookup[]>([]);
  const [ageCategories, setAgeCategories] = useState<AgeCategoryLookup[]>([]);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [data, t, a] = await Promise.all([
          apiService.getPersonalOrderById(orderId),
          apiService.getProductTypes(),
          apiService.getAgeCategories(),
        ]);
        setOrder(data);
        setTypes(t);
        setAgeCategories(a);
        setEditTitle(data.order_title);
        setEditDescription(data.order_description);
        setEditDeadline(data.order_deadline ?? '');
        setEditTypeId(t.find((x) => x.name === data.order_material_type)?.id ?? null);
        setEditAgeCategoryId(a.find((x) => x.name === data.order_material_age_category)?.id ?? null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Не вдалося завантажити замовлення';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      toast.error('Назва не може бути порожньою');
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await apiService.updatePersonalOrder(orderId, {
        orderTitle: editTitle.trim(),
        orderDescription: editDescription.trim(),
        orderDeadline: editDeadline || null,
        ...(editTypeId !== null && { orderMaterialType: editTypeId }),
        ...(editAgeCategoryId !== null && { orderMaterialAgeCategory: editAgeCategoryId }),
      });
      clearOrdersCache();
      setOrder(updated);
      setIsEditing(false);
      toast.success('Замовлення оновлено');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не вдалося оновити замовлення';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    setIsSubmitting(true);
    try {
      await apiService.deletePersonalOrder(orderId);
      clearOrdersCache();
      toast.success('Замовлення видалено');
      onOrderUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не вдалося видалити замовлення';
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const payment = await apiService.initiateOrderPayment(orderId);
      submitLiqPayForm(payment.data, payment.signature);
      // Browser navigates away to LiqPay; no further cleanup needed here.
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не вдалося розпочати оплату';
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  const handleUserDecline = async () => {
    if (!window.confirm('Відхилити це замовлення?')) { return; }
    setIsSubmitting(true);
    try {
      await apiService.updatePersonalOrder(orderId, { orderStatus: 'declined' });
      clearOrdersCache();
      toast.success('Замовлення відхилено');
      onOrderUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не вдалося відхилити замовлення';
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

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
          onClick={onBack}
          className="px-[24px] py-[10px] rounded-[12px] bg-white border border-[#4d4d4d] text-[16px] cursor-pointer hover:bg-[#e6e6e6] transition-colors"
          style={fontRegular}
        >
          Назад
        </button>
      </div>
    );
  }

  const status = order.order_status;
  const statusLabel = ORDER_STATUS_LABELS_USER[status] ?? status;
  const statusColor = ORDER_STATUS_COLORS[status] ?? '#4d4d4d';
  const isPending = status === 'pending';
  const isInReview = status === 'in_review';
  const isAccepted = status === 'accepted';
  const isDeclined = status === 'declined';
  const isDone = status === 'done';

  return (
    <div
      className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0 overflow-auto"
      data-name="PersonalOrderDetails"
    >
      <div className="box-border flex flex-col gap-[20px] p-[24px] h-full">

        {/* Header */}
        <div className="flex items-start gap-[16px] shrink-0">
          <h2
            className="text-[24px] text-[#0d0d0d] m-0 flex-1 min-w-0"
            style={fontBold}
          >
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={inputClass}
                style={fontBold}
                disabled={isSubmitting}
              />
            ) : order.order_title}
          </h2>
          <div className="flex items-center gap-[8px] shrink-0">
            <span
              className="text-[14px] font-medium px-[12px] py-[6px] rounded-[8px]"
              style={{ color: statusColor, backgroundColor: `${statusColor}18`, ...fontBold }}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Done: file placeholder */}
        {isDone && (
          <div className="rounded-[12px] border border-[#008000] bg-[#00800010] p-[16px] shrink-0">
            <p className="text-[16px] text-[#008000] m-0" style={fontBold}>Ваш файл готовий</p>
            <p className="text-[14px] text-[#4d4d4d] m-0 mt-[4px]" style={fontRegular}>
              Матеріал відправлено на Вашу електронну пошту.
            </p>
          </div>
        )}

        {/* Decline reason */}
        {isDeclined && order.order_decline_reason && (
          <div className="rounded-[12px] border border-[#cc0000] bg-[#cc000010] p-[16px] shrink-0">
            <p className="text-[14px] text-[#cc0000] m-0 mb-[4px]" style={fontBold}>Причина відхилення</p>
            <p className="text-[16px] text-[#0d0d0d] m-0" style={fontRegular}>{order.order_decline_reason}</p>
          </div>
        )}

        {/* Accepted: price + deadline confirmation banner */}
        {isAccepted && (
          <div className="rounded-[12px] border border-[#ff7b00] bg-[#ff7b0010] p-[16px] shrink-0">
            <p className="text-[14px] text-[#ff7b00] m-0 mb-[8px]" style={fontBold}>Підтвердіть замовлення</p>
            <p className="text-[16px] text-[#0d0d0d] m-0" style={fontRegular}>
              Ціна: <strong>{formatPrice(order.order_price)}</strong>
              {order.order_deadline && (
                <span> · Дедлайн: <strong>{formatDate(order.order_deadline)}</strong></span>
              )}
            </p>
            <p className="text-[13px] text-[#4d4d4d] m-0 mt-[6px]" style={fontRegular}>
              У вас є 72 години для підтвердження. Після спливання терміну замовлення буде автоматично відхилено.
            </p>
          </div>
        )}

        {/* Fields grid */}
        <div className="grid grid-cols-2 gap-[16px] shrink-0">
          <div>
            <label className="block text-[13px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>Тип контенту</label>
            {isEditing ? (
              <div className="relative">
                <select
                  value={editTypeId ?? ''}
                  onChange={(e) => setEditTypeId(e.target.value ? Number(e.target.value) : null)}
                  className={selectClass}
                  style={fontRegular}
                  disabled={isSubmitting}
                >
                  <option value="" disabled>Оберіть тип контенту</option>
                  {types
                    .filter((t) => t.name !== 'Безкоштовний матеріал')
                    .map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-[16px] top-1/2 -translate-y-1/2"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d={iconPaths.keyboardArrowDown} fill="#4d4d4d" />
                </svg>
              </div>
            ) : (
              <div className={fieldClass} style={fontRegular}>
                <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
                {order.order_material_type || '—'}
              </div>
            )}
          </div>
          <div>
            <label className="block text-[13px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>Вікова група</label>
            {isEditing ? (
              <div className="relative">
                <select
                  value={editAgeCategoryId ?? ''}
                  onChange={(e) => setEditAgeCategoryId(e.target.value ? Number(e.target.value) : null)}
                  className={selectClass}
                  style={fontRegular}
                  disabled={isSubmitting}
                >
                  <option value="" disabled>Оберіть вікову групу</option>
                  {ageCategories.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-[16px] top-1/2 -translate-y-1/2"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d={iconPaths.keyboardArrowDown} fill="#4d4d4d" />
                </svg>
              </div>
            ) : (
              <div className={fieldClass} style={fontRegular}>
                <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
                {order.order_material_age_category || '—'}
              </div>
            )}
          </div>
          {!isDeclined && !isPending && !isInReview && (
            <div>
              <label className="block text-[13px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>Ціна</label>
              <div className={fieldClass} style={fontRegular}>
                <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
                {formatPrice(order.order_price)}
              </div>
            </div>
          )}
          <div>
            <label className="block text-[13px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>Дедлайн</label>
            {isEditing ? (
              <input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                className={inputClass}
                style={fontRegular}
                disabled={isSubmitting}
              />
            ) : (
              <div className={fieldClass} style={fontRegular}>
                <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
                {formatDate(order.order_deadline)}
              </div>
            )}
          </div>
          {!isEditing && (
            <div>
              <label className="block text-[13px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>Дата замовлення</label>
              <div className={fieldClass} style={fontRegular}>
                <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
                {formatDate(order.order_created_at)}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="flex-1 flex flex-col min-h-[120px]">
          <label className="block text-[13px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>Опис замовлення</label>
          {isEditing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className={cn(
                'flex-1 w-full min-h-[120px] rounded-[12px] border border-[#b3b3b3] bg-white',
                'px-[16px] py-[12px] text-[16px] text-[#0d0d0d] outline-none',
                'focus:border-[#5e89e8] transition-colors resize-none'
              )}
              style={fontRegular}
              disabled={isSubmitting}
            />
          ) : (
            <div className="flex-1 bg-[#f2f2f2] relative rounded-[12px] p-[16px]">
              <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
              <p className="text-[16px] text-[#0d0d0d] m-0 leading-[24px] whitespace-pre-wrap" style={fontRegular}>
                {order.order_description}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-[12px] items-center justify-end shrink-0">
          {isPending && (
            <>
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                    className="h-[44px] px-[24px] rounded-[12px] border border-[#4d4d4d] bg-white text-[16px] text-[#4d4d4d] cursor-pointer hover:bg-[#e6e6e6] transition-colors disabled:opacity-50"
                    style={fontRegular}
                  >
                    Скасувати
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSubmitting}
                    className="h-[44px] px-[24px] rounded-[12px] bg-[#5e89e8] text-[16px] text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={fontBold}
                  >
                    {isSubmitting ? 'Збереження...' : 'Зберегти'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="h-[44px] px-[24px] rounded-[12px] border-none bg-transparent text-[16px] text-[#cc0000] underline cursor-pointer hover:opacity-70 transition-opacity disabled:opacity-50"
                    style={fontRegular}
                  >
                    Видалити замовлення
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={isSubmitting}
                    className="h-[44px] px-[24px] rounded-[12px] bg-[#5e89e8] text-[16px] text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={fontBold}
                  >
                    Редагувати
                  </button>
                </>
              )}
            </>
          )}

          {isAccepted && (
            <>
              <button
                onClick={handleUserDecline}
                disabled={isSubmitting}
                className="h-[44px] px-[24px] rounded-[12px] border-none bg-transparent text-[16px] text-[#cc0000] underline cursor-pointer hover:opacity-70 transition-opacity disabled:opacity-50"
                style={fontRegular}
              >
                Відхилити
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="h-[44px] px-[24px] rounded-[12px] bg-[#5e89e8] text-[16px] text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                style={fontBold}
              >
                {isSubmitting ? 'Обробка...' : 'Підтвердити та оплатити'}
              </button>
            </>
          )}
        </div>

      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[24px] p-[32px] flex flex-col gap-[24px] max-w-[764px] mx-[24px]">
            <h5 className="text-[40px] text-[#0d0d0d] text-center m-0" style={fontRegular}>
              Ви впевнені, що хочете видалити це замовлення?
            </h5>
            <p className="text-[20px] text-[#4d4d4d] text-center m-0" style={fontRegular}>
              Якщо Ви натиснете &ldquo;Підтвердити&rdquo;, це замовлення буде повністю видалено і цю дію неможливо буде відмінити
            </p>
            <div className="flex gap-[16px] justify-center">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="h-[44px] px-[24px] rounded-[12px] border border-solid border-[#4d4d4d] bg-white cursor-pointer text-[16px] text-[#0d0d0d] hover:bg-[#f5f5f5] transition-colors"
                style={fontRegular}
              >
                Повернутись
              </button>
              <button
                onClick={confirmDelete}
                className="h-[44px] px-[24px] rounded-[12px] border-none bg-[#E53935] text-white cursor-pointer text-[16px] hover:opacity-90 transition-opacity"
                style={fontBold}
              >
                Підтвердити видалення
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
