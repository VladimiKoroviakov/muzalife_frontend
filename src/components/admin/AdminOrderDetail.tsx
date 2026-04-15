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

import { useState, useEffect, useRef, type DragEvent, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';
import { ORDER_STATUS_LABELS_ADMIN, ORDER_STATUS_COLORS } from '@/constants/api';
import { iconPaths } from '../ui/icons/iconPaths';
import type { PersonalOrder, ProductFile } from '@/types';

function truncateFileName(name: string): string {
  if (name.length <= 10) { return name; }
  const lastDot = name.lastIndexOf('.');
  const ext = lastDot >= 0 ? name.slice(lastDot) : '';
  const base = lastDot >= 0 ? name.slice(0, lastDot) : name;
  if (base.length <= 6) { return name; }
  return `${base.slice(0, 4)}...${base.slice(-2)}${ext}`;
}

function FileChip({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <div className="relative flex flex-row items-center gap-[8px] rounded-[8px] px-3 py-2 rounded-[16px] bg-background w-auto max-w-[160px] border border-solid border-[#e6e6e6]">
      <button
        onClick={onRemove}
        aria-label={`Видалити ${name}`}
        className="absolute top-[-8px] right-[-4px] w-[20px] h-[20px] rounded-full border border-solid border-[#4d4d4d] flex items-center justify-center cursor-pointer hover:border-[#999] transition-colors"
      >
        <svg className="block" fill="none" viewBox="0 0 28 28" width={12} height={12}>
          <path d={iconPaths.close} fill="#4d4d4d" />
        </svg>
      </button>
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
        <mask id="mask0_order_chip" maskUnits="userSpaceOnUse" x="0" y="0" width="28" height="28">
          <rect width="28" height="28" fill="#D9D9D9"/>
        </mask>
        <g>
          <path d="M9.33366 15.1663H18.667V12.833H9.33366V15.1663ZM9.33366 18.6663H18.667V16.333H9.33366V18.6663ZM9.33366 22.1663H15.167V19.833H9.33366V22.1663ZM7.00033 25.6663C6.35866 25.6663 5.80935 25.4379 5.35241 24.9809C4.89546 24.524 4.66699 23.9747 4.66699 23.333V4.66634C4.66699 4.02467 4.89546 3.47537 5.35241 3.01842C5.80935 2.56148 6.35866 2.33301 7.00033 2.33301H16.3337L23.3337 9.33301V23.333C23.3337 23.9747 23.1052 24.524 22.6482 24.9809C22.1913 25.4379 21.642 25.6663 21.0003 25.6663H7.00033ZM15.167 10.4997H21.0003L15.167 4.66634V10.4997Z" fill="#5E89E8"/>
        </g>
      </svg>
      <span className="text-[12px] text-[#0d0d0d]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        {truncateFileName(name)}
      </span>
    </div>
  );
}

function DashedBorder({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 w-full pointer-events-none overflow-visible h-full">
      <rect
        x="1" y="1"
        width="calc(100% - 2px)" height="calc(100% - 2px)"
        rx="11" ry="11"
        fill="none"
        stroke={active ? '#5e89e8' : '#4d4d4d'}
        strokeWidth="1"
        strokeDasharray="10 8"
      />
    </svg>
  );
}

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) { return `${bytes} B`; }
  if (bytes < 1024 * 1024) { return `${(bytes / 1024).toFixed(1)} KB`; }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  // File upload state (in_development / done)
  const [orderFiles, setOrderFiles] = useState<ProductFile[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [isFileDragOver, setIsFileDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Send materials state (done)
  const [isSendingMaterials, setIsSendingMaterials] = useState(false);

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
        if (data.order_status === 'in_development' || data.order_status === 'done') {
          try {
            const files = await apiService.adminGetPersonalOrderFiles(Number(orderId));
            setOrderFiles(files);
          } catch {
            // Non-fatal — show the order without files on error
          }
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

  const handleFinish = async () => {
    if (!orderId) { return; }
    if (pendingFiles.length > 0) {
      setIsUploadingFiles(true);
      try {
        const uploaded = await apiService.adminUploadPersonalOrderFiles(Number(orderId), pendingFiles);
        setOrderFiles((prev) => [...prev, ...uploaded]);
        setPendingFiles([]);
      } catch {
        toast.error('Не вдалося завантажити файли');
        setIsUploadingFiles(false);
        return;
      }
      setIsUploadingFiles(false);
    }
    handleTransition({ orderStatus: 'done' });
  };

  // ── Send materials handler (done) ────────────────────────────────────────────

  const handleSendMaterials = async () => {
    setIsSendingMaterials(true);
    try {
      await apiService.adminSendPersonalOrderMaterials(Number(orderId));
      toast.success('Матеріали надіслано замовнику');
    } catch {
      toast.error('Помилка при відправці матеріалів');
    } finally {
      setIsSendingMaterials(false);
    }
  };

  // ── File upload handlers ────────────────────────────────────────────────────

  const handleFileDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsFileDragOver(true); };
  const handleFileDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsFileDragOver(false); };
  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsFileDragOver(false);
    setPendingFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (selected.length > 0) { setPendingFiles((prev) => [...prev, ...selected]); }
  };
  const removePendingFile = (index: number) => setPendingFiles((prev) => prev.filter((_, i) => i !== index));

  const handleDeleteOrderFile = async (fileId: number) => {
    if (!orderId) { return; }
    try {
      await apiService.adminDeletePersonalOrderFile(Number(orderId), fileId);
      setOrderFiles((prev) => prev.filter((f) => f.fileId !== fileId));
      toast.success('Файл видалено');
    } catch {
      toast.error('Не вдалося видалити файл');
    }
  };

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
      <div className="box-border flex flex-col gap-[24px] p-[24px] h-full">

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
          <div className="bg-white rounded-[16px] px-[20px] py-[12px] shrink-0">
            <p className="text-[13px] text-[#4d4d4d] m-0" style={fontRegular}>
              Замовник: <strong style={fontBold}>{order.user_name ?? order.user_email}</strong>
              {order.user_name && order.user_email && (
                <span className="text-[#4d4d4d]"> ({order.user_email})</span>
              )}
            </p>
          </div>
        )}

        {/* Status alerts */}
        {status === 'declined' && order.order_decline_reason && (
          <div className="rounded-[12px] border border-[#cc0000] bg-[#cc000010] p-[16px] shrink-0">
            <p className="text-[13px] text-[#cc0000] m-0 mb-[4px]" style={fontBold}>Причина відхилення</p>
            <p className="text-[16px] text-[#0d0d0d] m-0" style={fontRegular}>{order.order_decline_reason}</p>
          </div>
        )}

        {status === 'in_development' && (
          <div className="rounded-[12px] border border-[#0066cc] bg-[#0066cc10] p-[16px] shrink-0">
            <p className="text-[14px] text-[#0066cc] m-0" style={fontRegular}>
              Замовлення в розробці. Завантажте готові файли нижче для передачі клієнту.
            </p>
          </div>
        )}

        {status === 'accepted' && (
          <div className="rounded-[12px] border border-[#ff7b00] bg-[#ff7b0010] p-[16px] shrink-0">
            <p className="text-[14px] text-[#ff7b00] m-0" style={fontBold}>Очікує підтвердження від клієнта</p>
            <p className="text-[13px] text-[#4d4d4d] m-0 mt-[4px]" style={fontRegular}>
              Клієнт має 72 години для підтвердження. Після спливання терміну замовлення буде автоматично відхилено.
            </p>
          </div>
        )}

         {/* Upload drop-zone — only when in_development */}
            {status === 'in_development' && (
              <>
                <div
                  className="relative rounded-[12px] shrink-0 w-full"
                  onDragOver={handleFileDragOver}
                  onDragLeave={handleFileDragLeave}
                  onDrop={handleFileDrop}
                >
                  <DashedBorder active={isFileDragOver} />
                  <div className="flex flex-col items-center justify-center w-full px-[48px] py-[40px] gap-[16px]">
                    {pendingFiles.length === 0 && orderFiles.length === 0 && (
                      <div className="relative shrink-0 w-[80px] h-[80px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="94" height="75" viewBox="0 0 94 75" fill="none">
                          <path d="M9.33333 74.6667C6.76667 74.6667 4.56944 73.7528 2.74167 71.925C0.913889 70.0972 0 67.9 0 65.3333V9.33333C0 6.76667 0.913889 4.56944 2.74167 2.74167C4.56944 0.913889 6.76667 0 9.33333 0H37.3333L46.6667 9.33333H84C86.5667 9.33333 88.7639 10.2472 90.5917 12.075C92.4195 13.9028 93.3333 16.1 93.3333 18.6667V65.3333C93.3333 67.9 92.4195 70.0972 90.5917 71.925C88.7639 73.7528 86.5667 74.6667 84 74.6667H9.33333ZM42 60.6667H51.3333V41.0667L58.8 48.5333L65.3333 42L46.6667 23.3333L28 42L34.5333 48.5333L42 41.0667V60.6667Z" fill="#1C1B1F" />
                        </svg>
                      </div>
                    )}

                    <p className="text-[20px] text-[#0d0d0d] text-center m-0 leading-[28px]" style={fontBold}>
                      Перетягніть готові файли сюди
                    </p>

                    <p className="text-[16px] text-[#4d4d4d] text-center m-0 leading-[24px]" style={fontRegular}>
                      або
                    </p>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingFiles}
                      className="bg-white box-border flex items-center justify-center gap-[8px] h-[44px] px-[24px] py-[12px] rounded-[12px] border border-solid border-[#0d0d0d] cursor-pointer text-[16px] text-[#0d0d0d] hover:bg-gray-50 transition-colors disabled:opacity-50"
                      style={fontRegular}
                    >
                      {pendingFiles.length > 0 ? 'Оберіть ще файли' : 'Оберіть файли'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".rar,.zip,.docx,.pdf,.pptx,.png,.jpg"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    <p className="text-[14px] text-[#4d4d4d] text-center m-0 leading-[24px]" style={fontRegular}>
                      Дозволені типи файлів: .rar .zip .docx .pdf .pptx .png .jpg
                    </p>

                    {(orderFiles.length > 0 || pendingFiles.length > 0) && (
                      <div className="flex flex-wrap gap-[8px] justify-start w-full">
                        {orderFiles.map((f) => (
                          <FileChip key={`existing-${f.fileId}`} name={f.fileName} onRemove={() => handleDeleteOrderFile(f.fileId)} />
                        ))}
                        {pendingFiles.map((file, index) => (
                          <FileChip key={`pending-${file.name}-${index}`} name={file.name} onRemove={() => removePendingFile(index)} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Compact info + action strip — replaces the full info card and action button for in_development */}
                <div className="bg-white rounded-[16px] px-[16px] py-[12px] flex items-center gap-[16px] shrink-0">
                  <div className="shrink-0">
                    <p className="text-[11px] text-[#4d4d4d] m-0 mb-[2px]" style={fontRegular}>Тип матеріалу</p>
                    <p className="text-[13px] text-[#0d0d0d] m-0" style={fontRegular}>{order.order_material_type || '—'}</p>
                  </div>
                  <div className="w-px h-[36px] bg-[#f2f2f2] shrink-0" />
                  <div className="shrink-0">
                    <p className="text-[11px] text-[#4d4d4d] m-0 mb-[2px]" style={fontRegular}>Вікова група</p>
                    <p className="text-[13px] text-[#0d0d0d] m-0" style={fontRegular}>{order.order_material_age_category || '—'}</p>
                  </div>
                  <div className="w-px h-[36px] bg-[#f2f2f2] shrink-0" />
                  <div className="shrink-0">
                    <p className="text-[11px] text-[#4d4d4d] m-0 mb-[2px]" style={fontRegular}>Ціна</p>
                    <p className="text-[13px] text-[#0d0d0d] m-0" style={fontRegular}>{formatPrice(order.order_price)}</p>
                  </div>
                  <div className="w-px h-[36px] bg-[#f2f2f2] shrink-0" />
                  <div className="shrink-0">
                    <p className="text-[11px] text-[#4d4d4d] m-0 mb-[2px]" style={fontRegular}>Дедлайн</p>
                    <p className="text-[13px] text-[#0d0d0d] m-0" style={fontRegular}>{formatDate(order.order_deadline)}</p>
                  </div>
                  <div className="w-px h-[36px] bg-[#f2f2f2] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#4d4d4d] m-0 mb-[2px]" style={fontRegular}>Опис замовлення</p>
                    <p className="text-[13px] text-[#0d0d0d] m-0 truncate" style={fontRegular}>{order.order_description}</p>
                  </div>
                  <button
                    onClick={handleFinish}
                    disabled={isSubmitting || isUploadingFiles}
                    className="h-[44px] px-[24px] rounded-[12px] bg-[#5e89e8] text-[16px] text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
                    style={fontBold}
                  >
                    {isUploadingFiles ? 'Завантаження...' : isSubmitting ? 'Обробка...' : 'Завершити замовлення'}
                  </button>
                </div>
              </>
            )}

        {/* Compact info card — all order metadata + description in one block */}
        {status !== 'in_development' && <div className="bg-white rounded-[16px] p-[16px] flex flex-col gap-[10px] shrink-0">

          {/* Metadata row */}
          <div className="grid grid-cols-5 gap-x-[12px]">
            <div>
              <p className="text-[11px] text-[#4d4d4d] m-0 mb-[4px]" style={fontRegular}>Тип матеріалу</p>
              <p className="text-[14px] text-[#0d0d0d] m-0 leading-[20px]" style={fontRegular}>
                {order.order_material_type || '—'}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] text-[#4d4d4d] m-0 mb-[4px]" style={fontRegular}>Вікова група</p>
              <p className="text-[14px] text-[#0d0d0d] m-0 leading-[20px]" style={fontRegular}>
                {order.order_material_age_category || '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#4d4d4d] m-0 mb-[4px]" style={fontRegular}>Ціна</p>
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
                <p className="text-[14px] text-[#0d0d0d] m-0 leading-[20px]" style={fontRegular}>
                  {formatPrice(order.order_price)}
                </p>
              )}
            </div>
            <div>
              <p className="text-[11px] text-[#4d4d4d] m-0 mb-[4px]" style={fontRegular}>
                Дедлайн{status === 'in_review' && <span className="text-[#4d4d4d]"> (необов&apos;язк.)</span>}
              </p>
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
                <p className="text-[14px] text-[#0d0d0d] m-0 leading-[20px]" style={fontRegular}>
                  {formatDate(order.order_deadline)}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-[#f2f2f2]" />

          {/* Description */}
          <div>
            <p className="text-[11px] text-[#4d4d4d] m-0 mb-[4px]" style={fontRegular}>Опис замовлення</p>
            <p className="text-[14px] text-[#0d0d0d] m-0 leading-[22px] whitespace-pre-wrap" style={fontRegular}>
              {order.order_description}
            </p>
          </div>

          {/* Date — bottom right */}
          <p className="text-[11px] text-[#4d4d4d] m-0 text-right" style={fontRegular}>
            Замовлення від {formatDate(order.order_created_at)}
          </p>
        </div>}

        {/* Files section — done (read-only list) */}
        {status === 'done' && (
          <div className="bg-white rounded-[16px] p-[20px] flex flex-col gap-[10px] shrink-0">
            <p className="text-[13px] text-[#4d4d4d] m-0" style={fontRegular}>
              Файли замовлення ({orderFiles.length})
            </p>
            {orderFiles.length === 0 && (
              <p className="text-[14px] text-[#4d4d4d] m-0" style={fontRegular}>Файли не завантажені.</p>
            )}
            {orderFiles.map((f) => (
              <div key={f.fileId} className="flex items-center gap-[12px] py-[6px] border-b border-[#f2f2f2] last:border-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 28 28" fill="none" className="shrink-0">
                  <mask id="mask0_file_done" maskUnits="userSpaceOnUse" x="0" y="0" width="28" height="28">
                    <rect width="28" height="28" fill="#D9D9D9"/>
                  </mask>
                  <g>
                    <path d="M9.33366 15.1663H18.667V12.833H9.33366V15.1663ZM9.33366 18.6663H18.667V16.333H9.33366V18.6663ZM9.33366 22.1663H15.167V19.833H9.33366V22.1663ZM7.00033 25.6663C6.35866 25.6663 5.80935 25.4379 5.35241 24.9809C4.89546 24.524 4.66699 23.9747 4.66699 23.333V4.66634C4.66699 4.02467 4.89546 3.47537 5.35241 3.01842C5.80935 2.56148 6.35866 2.33301 7.00033 2.33301H16.3337L23.3337 9.33301V23.333C23.3337 23.9747 23.1052 24.524 22.6482 24.9809C22.1913 25.4379 21.642 25.6663 21.0003 25.6663H7.00033ZM15.167 10.4997H21.0003L15.167 4.66634V10.4997Z" fill="#5E89E8"/>
                  </g>
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-[#0d0d0d] m-0 truncate" style={fontRegular}>{f.fileName}</p>
                  <p className="text-[12px] text-[#4d4d4d] m-0" style={fontRegular}>{formatFileSize(f.fileSize)}</p>
                </div>
                <a
                  href={f.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] text-[#5e89e8] underline cursor-pointer shrink-0"
                  style={fontRegular}
                >
                  Скачати
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Send materials button — done */}
        {status === 'done' && (
          <div className="flex justify-end">
            <button
              onClick={handleSendMaterials}
              disabled={isSendingMaterials}
              className="h-[44px] px-[24px] rounded-[12px] bg-[#5e89e8] text-[16px] text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
              style={fontRegular}
            >
              {isSendingMaterials ? 'Відправка...' : 'Надіслати матеріали замовнику'}
            </button>
          </div>
        )}

        {/* Decline form card */}
        {showDeclineForm && (
          <div className="bg-white rounded-[16px] p-[20px] flex flex-col gap-[8px] shrink-0">
            <label className="text-[13px] text-[#4d4d4d]" style={fontRegular}>
              Причина відхилення <span className="text-[#cc0000]">*</span>
            </label>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Поясніть причину відхилення замовлення..."
              rows={3}
              className={cn(
                'w-full rounded-[12px] border border-[#b3b3b3] bg-[#f2f2f2] px-[16px] py-[12px]',
                'text-[16px] text-[#0d0d0d] outline-none focus:border-[#cc0000] transition-colors resize-none'
              )}
              style={fontRegular}
              disabled={isSubmitting}
            />
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

        </div>

      </div>
    </div>
  );
}
