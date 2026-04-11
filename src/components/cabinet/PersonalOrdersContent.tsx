/**
 * @fileoverview Personal orders list panel for the user cabinet.
 *
 * Displays a table of the authenticated user's personal orders with status
 * labels, colours, and action navigation. Wires up the create-order and
 * order-detail flows via callback props.
 *
 * @module components/cabinet/PersonalOrdersContent
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { iconPaths } from '../ui/icons/iconPaths';
import { Table, TextCell, EmptyCell, TableCell } from '../layout/dashboard/TableComponents';
import { apiService } from '../../services/api';
import { CacheManager } from '../../utils/cache-manager';
import { ORDER_STATUS_LABELS_USER, ORDER_STATUS_COLORS } from '../../constants/api';
import config from '../../config';
import type { PersonalOrder } from '../../types';

interface PersonalOrdersContentProps {
  /**
   * Called when the user clicks "Зробити нове замовлення".
   */
  onCreateOrder: () => void;
  /**
   * Called when the user clicks an order row action.
   *
   * @param orderId - ID of the selected order.
   */
  onViewOrder: (orderId: number) => void;
  /**
   * Increment to force a cache-bypassing refresh of the orders list.
   */
  refreshKey?: number;
}

/**
 * Table view listing all of the current user's personal orders.
 *
 * Caches responses for {@link config.cacheDurations.PERSONAL_ORDERS} ms.
 *
 * @param props.onCreateOrder - Navigate to the create-order form.
 * @param props.onViewOrder - Navigate to the order detail view.
 * @returns The orders list panel.
 * @example
 * ```tsx
 * <PersonalOrdersContent
 *   onCreateOrder={() => setSection('orders-create')}
 *   onViewOrder={(id) => { setOrderId(id); setSection('orders-detail'); }}
 * />
 * ```
 */
export function PersonalOrdersContent({ onCreateOrder, onViewOrder, refreshKey = 0 }: PersonalOrdersContentProps) {
  const [orders, setOrders] = useState<PersonalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableHeight, setTableHeight] = useState<number>(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // ── Cache helpers ──────────────────────────────────────────────────────────

  const getCachedOrders = useCallback((): PersonalOrder[] | null => {
    try {
      const cached = CacheManager.getItem<PersonalOrder[]>(config.cacheKeys.PERSONAL_ORDERS);
      if (cached && Array.isArray(cached)) { return cached; }
    } catch { /* ignore */ }
    return null;
  }, []);

  const setCachedOrders = useCallback((data: PersonalOrder[]): void => {
    try {
      const minimal = data.map((o) => ({
        order_id: o.order_id,
        order_title: o.order_title,
        order_description: o.order_description,
        order_status: o.order_status,
        order_price: o.order_price,
        order_material_type: o.order_material_type,
        order_material_age_category: o.order_material_age_category,
        order_deadline: o.order_deadline,
        order_created_at: o.order_created_at,
        order_decline_reason: o.order_decline_reason,
        user_id: o.user_id,
      }));
      CacheManager.setItem(config.cacheKeys.PERSONAL_ORDERS, minimal);
      CacheManager.setItem(config.cacheKeys.PERSONAL_ORDERS_TIMESTAMP, Date.now());
    } catch { /* ignore */ }
  }, []);

  const isOrdersCacheValid = useCallback((): boolean => {
    try {
      const ts = CacheManager.getItem<number>(config.cacheKeys.PERSONAL_ORDERS_TIMESTAMP);
      if (!ts) { return false; }
      return Date.now() - ts < config.cacheDurations.PERSONAL_ORDERS;
    } catch {
      return false;
    }
  }, []);

  const clearOrdersCache = useCallback((): void => {
    try {
      CacheManager.removeItem(config.cacheKeys.PERSONAL_ORDERS);
      CacheManager.removeItem(config.cacheKeys.PERSONAL_ORDERS_TIMESTAMP);
    } catch { /* ignore */ }
  }, []);

  // ── Data loading ───────────────────────────────────────────────────────────

  const loadPersonalOrders = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      if (!forceRefresh) {
        const cached = getCachedOrders();
        if (cached && isOrdersCacheValid()) {
          setOrders(cached);
          setLoading(false);
          return;
        }
      }

      const data = await apiService.getPersonalOrders();
      setCachedOrders(data);
      setOrders(data);
    } catch (err: unknown) {
      const cached = getCachedOrders();
      if (cached) {
        setOrders(cached);
        setError('Не вдалося завантажити нові дані. Показано закешовані замовлення.');
      } else {
        const msg = err instanceof Error ? err.message : 'Не вдалося завантажити замовлення';
        toast.error(msg);
        setError(msg);
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  }, [getCachedOrders, isOrdersCacheValid, setCachedOrders]);

  const forceRefresh = useCallback(() => {
    clearOrdersCache();
    loadPersonalOrders(true);
  }, [clearOrdersCache, loadPersonalOrders]);

  useEffect(() => { loadPersonalOrders(); }, [loadPersonalOrders]);

  useEffect(() => {
    if (refreshKey > 0) {
      clearOrdersCache();
      loadPersonalOrders(true);
    }
  }, [refreshKey, clearOrdersCache, loadPersonalOrders]);

  // ── Table height for empty row calculation ─────────────────────────────────

  useEffect(() => {
    const update = () => {
      if (tableContainerRef.current) {
        const el = tableContainerRef.current;
        const style = window.getComputedStyle(el);
        const height = el.clientHeight
          - parseFloat(style.paddingTop)
          - parseFloat(style.paddingBottom);
        setTableHeight(height);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getRowBg = (index: number) => index % 2 === 0 ? '#f2f2f2' : '#e6e6e6';

  const getEmptyRowsCount = () => {
    if (orders.length === 0) { return 0; }
    const rowHeight = 40;
    if (tableHeight > 0) {
      const rowsThatFit = Math.floor((tableHeight - rowHeight) / rowHeight);
      return Math.max(0, rowsThatFit - orders.length);
    }
    return Math.max(0, 14 - orders.length);
  };

  const formatDate = (ds: string): string => {
    try {
      return new Date(ds).toLocaleDateString('uk-UA', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });
    } catch { return ds; }
  };

  const formatPrice = (price: number | null): string => {
    if (price === null || price === undefined) { return '—'; }
    const n = Number(price);
    if (isNaN(n) || n <= 0) { return '—'; }
    return `${n.toFixed(2)} грн`;
  };

  const getActionText = (status: string): string => {
    if (status === 'accepted') { return 'Підтвердити'; }
    if (status === 'pending') { return 'Переглянути'; }
    return 'Переглянути';
  };

  const isActionBold = (status: string) => status === 'accepted';
  const getActionColor = (status: string) => status === 'accepted' ? '#ff7b00' : '#4d4d4d';

  const emptyRowsCount = getEmptyRowsCount();

  // ── Table columns ──────────────────────────────────────────────────────────

  const generateTableData = () => {
    const empty = (key: string) =>
      emptyRowsCount > 0
        ? Array.from({ length: emptyRowsCount }, (_, i) => (
          <EmptyCell key={`empty-${key}-${i}`} bg={getRowBg(orders.length + i)} />
        ))
        : [];

    return [
      {
        header: 'Назва Замовлення',
        width: '30%',
        minWidth: '180px',
        cells: [
          ...orders.map((o, i) => (
            <TextCell key={`name-${o.order_id}`} text={o.order_title} bg={getRowBg(i)} />
          )),
          ...empty('name'),
        ],
      },
      {
        header: 'Тип матеріалу',
        width: '15%',
        minWidth: '130px',
        cells: [
          ...orders.map((o, i) => (
            <TextCell key={`type-${o.order_id}`} text={o.order_material_type || '—'} bg={getRowBg(i)} />
          )),
          ...empty('type'),
        ],
      },
      {
        header: 'Дедлайн',
        width: '12%',
        minWidth: '110px',
        cells: [
          ...orders.map((o, i) => (
            <TextCell
              key={`deadline-${o.order_id}`}
              text={o.order_deadline ? formatDate(o.order_deadline) : '—'}
              bg={getRowBg(i)}
            />
          )),
          ...empty('deadline'),
        ],
      },
      {
        header: 'Ціна',
        width: '10%',
        minWidth: '90px',
        cells: [
          ...orders.map((o, i) => (
            <TextCell key={`price-${o.order_id}`} text={formatPrice(o.order_price)} bg={getRowBg(i)} />
          )),
          ...empty('price'),
        ],
      },
      {
        header: 'Статус',
        width: '20%',
        minWidth: '180px',
        cells: [
          ...orders.map((o, i) => (
            <TextCell
              key={`status-${o.order_id}`}
              text={ORDER_STATUS_LABELS_USER[o.order_status] ?? o.order_status}
              bg={getRowBg(i)}
              bold={isActionBold(o.order_status)}
              color={ORDER_STATUS_COLORS[o.order_status] ?? '#4d4d4d'}
            />
          )),
          ...empty('status'),
        ],
      },
      {
        header: 'Дії',
        width: '10%',
        minWidth: '110px',
        cells: [
          ...orders.map((o, i) => (
            <TableCell key={`action-${o.order_id}`} bg={getRowBg(i)}>
              <div className="flex items-center justify-center w-full h-[40px] px-[16px]">
                <button
                  onClick={() => onViewOrder(o.order_id)}
                  className={`bg-transparent border-none p-0 text-[16px] cursor-pointer hover:opacity-70 transition-opacity ${isActionBold(o.order_status) ? 'font-bold underline' : 'underline'}`}
                  style={{ color: getActionColor(o.order_status) }}
                >
                  {getActionText(o.order_status)}
                </button>
              </div>
            </TableCell>
          )),
          ...empty('action'),
        ],
      },
    ];
  };

  // ── Bottom row shared markup ───────────────────────────────────────────────

  const BottomRow = () => (
    <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0 w-full" data-name="row">
      <p
        className="[text-underline-position:from-font] [white-space-collapse:collapse] basis-0 decoration-solid font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] grow leading-[normal] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap underline cursor-pointer hover:text-[#5e89e8] transition-colors"
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
      >
        Умови та Політика Використання
      </p>
      <button
        onClick={forceRefresh}
        className="bg-white box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-[#e6e6e6] transition-colors border border-[#4d4d4d]"
      >
        <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
          <p className="leading-[normal] whitespace-pre">Оновити</p>
        </div>
      </button>
      <div
        onClick={onCreateOrder}
        className="bg-white box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-[#e6e6e6] transition-colors"
        data-name="Button"
      >
        <div aria-hidden="true" className="absolute border border-[#4d4d4d] border-solid inset-0 pointer-events-none rounded-[12px]" />
        <div className="relative shrink-0 size-[20px]" data-name="icon order">
          <div className="absolute inset-[8.33%_4.17%_8.33%_12.5%]" data-name="contract_edit">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
              <path d={iconPaths.contractEditSmall} fill="var(--fill-0, #0D0D0D)" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
          <p className="leading-[normal] whitespace-pre">Зробити нове замовлення</p>
        </div>
      </div>
    </div>
  );

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0">
        <div className="size-full">
          <div className="box-border content-stretch flex flex-col gap-[20px] items-start relative size-full overflow-hidden px-[24px] py-[16px]">
            <div className="basis-0 bg-[#f2f2f2] content-stretch flex gap-[8px] grow items-start min-h-px min-w-px overflow-clip relative shrink-0 w-full">
              <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-auto flex items-center justify-center">
                <p className="text-[#4d4d4d] text-[18px]">Завантаження замовлень...</p>
              </div>
            </div>
            <BottomRow />
          </div>
        </div>
      </div>
    );
  }

  // ── Error state (with fallback to stale cache) ─────────────────────────────

  if (error && orders.length === 0) {
    return (
      <div className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0">
        <div className="size-full">
          <div className="box-border content-stretch flex flex-col gap-[20px] items-start relative size-full overflow-hidden px-[24px] py-[16px]">
            <div className="basis-0 bg-[#f2f2f2] content-stretch flex gap-[8px] grow items-start min-h-px min-w-px overflow-clip relative shrink-0 w-full">
              <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-auto flex flex-col items-center justify-center gap-2">
                <p className="text-[#cc0000] text-[18px] text-center">{error}</p>
                <button
                  onClick={() => loadPersonalOrders(true)}
                  className="bg-white px-4 py-2 rounded-md border border-[#4d4d4d] hover:bg-[#e6e6e6] transition-colors"
                >
                  Спробувати знову
                </button>
              </div>
            </div>
            <BottomRow />
          </div>
        </div>
      </div>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────

  return (
    <div className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-start relative size-full overflow-hidden px-[24px] py-[16px]">
          {error && (
            <p className="text-[13px] text-[#ff9900] w-full shrink-0">{error}</p>
          )}
          <div
            ref={tableContainerRef}
            className="basis-0 bg-[#f2f2f2] content-stretch flex gap-[8px] grow items-start min-h-px min-w-px overflow-clip relative shrink-0 w-full"
            data-name="Scrolling Table"
          >
            <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-auto" data-name="Table">
              <div className="content-stretch flex gap-[2px] items-start overflow-x-clip overflow-y-auto relative size-full rounded-[12px] w-full">
                {orders.length > 0 ? (
                  <Table columns={generateTableData()} />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <p className="text-[#4d4d4d] text-[18px] text-center">У вас ще немає замовлень</p>
                  </div>
                )}
              </div>
              <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
            </div>
          </div>
          <BottomRow />
        </div>
      </div>
    </div>
  );
}
