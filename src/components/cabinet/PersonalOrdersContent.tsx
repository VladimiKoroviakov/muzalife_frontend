import { useState, useEffect, useCallback, useRef } from 'react';
import { iconPaths } from '../ui/icons/iconPaths';
import { Table, TextCell, EmptyCell, TableCell } from './TableComponents';
import { apiService } from '../../services/api';
import { PersonalOrder } from '../../types';
import { CacheManager } from '../../utils/cache-manager';
import config from '../../config';

export function PersonalOrdersContent() {
  const [orders, setOrders] = useState<PersonalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableHeight, setTableHeight] = useState<number>(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Cache management functions
  const getCachedOrders = useCallback((): PersonalOrder[] | null => {
    try {
      const cached = CacheManager.getItem<PersonalOrder[]>(config.cacheKeys.PERSONAL_ORDERS);
      if (cached && Array.isArray(cached)) {
        console.log('📦 Retrieved personal orders from cache');
        return cached;
      }
    } catch (error) {
      console.error('Error reading cached personal orders:', error);
    }
    return null;
  }, []);

  const setCachedOrders = useCallback((orders: PersonalOrder[]): void => {
    try {
      // Store minimal fields to reduce cache size
      const cachedOrders = orders.map((order) => ({
        order_id: order.order_id,
        order_title: order.order_title,
        order_description: order.order_description,
        order_status: order.order_status,
        order_price: order.order_price,
        order_deadline: order.order_deadline,
        order_created_at: order.order_created_at
      }));

      // Use CacheManager for consistent caching
      CacheManager.setItem(config.cacheKeys.PERSONAL_ORDERS, cachedOrders);
      CacheManager.setItem(config.cacheKeys.PERSONAL_ORDERS_TIMESTAMP, Date.now());
      console.log('💾 Saved personal orders to cache (minimal fields)');
    } catch (error) {
      console.error('Error caching personal orders:', error);
    }
  }, []);

  const isOrdersCacheValid = useCallback((): boolean => {
    try {
      const cacheTimestamp = CacheManager.getItem<number>(config.cacheKeys.PERSONAL_ORDERS_TIMESTAMP);
      if (!cacheTimestamp) {return false;}

      const currentTime = Date.now();
      const cacheAge = currentTime - cacheTimestamp;

      // Check if cache is still valid
      return cacheAge < config.cacheDurations.PERSONAL_ORDERS;
    } catch {
      return false;
    }
  }, []);

  const clearOrdersCache = useCallback((): void => {
    try {
      CacheManager.removeItem(config.cacheKeys.PERSONAL_ORDERS);
      CacheManager.removeItem(config.cacheKeys.PERSONAL_ORDERS_TIMESTAMP);
      console.log('🧹 Personal orders cache cleared');
    } catch (error) {
      console.error('Error clearing personal orders cache:', error);
    }
  }, []);

  // Load personal orders from API with caching
  const loadPersonalOrders = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedOrders = getCachedOrders();
        const isCacheValid = isOrdersCacheValid();

        if (cachedOrders && isCacheValid) {
          console.log('🔄 Using cached personal orders');
          setOrders(cachedOrders);
          setLoading(false);
          return;
        }
      }

      console.log('🔄 Fetching fresh personal orders from API');
      const personalOrders = await apiService.getPersonalOrders();

      // Cache the fresh orders
      setCachedOrders(personalOrders);

      // Update state
      setOrders(personalOrders);
    } catch (err: any) {
      console.error('Failed to fetch personal orders:', err);

      // Try to fallback to cached orders even if expired
      const cachedOrders = getCachedOrders();
      if (cachedOrders) {
        console.log('📦 Falling back to cached personal orders (API failed)');
        setOrders(cachedOrders);
        setError('Не вдалося завантажити нові дані. Показано закешовані замовлення.');
      } else {
        setError(err.message || 'Не вдалося завантажити замовлення');
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  }, [getCachedOrders, isOrdersCacheValid, setCachedOrders]);

  // Force refresh function
  const forceRefreshOrders = useCallback(() => {
    clearOrdersCache();
    loadPersonalOrders(true);
  }, [clearOrdersCache, loadPersonalOrders]);

  // Initial load
  useEffect(() => {
    loadPersonalOrders();
  }, [loadPersonalOrders]);

  // Update cache when orders change (e.g., after confirming an order)
  useEffect(() => {
    if (orders.length > 0 && !loading && !error) {
      setCachedOrders(orders);
    }
  }, [orders, loading, error, setCachedOrders]);

  // Calculate table height for empty rows
  useEffect(() => {
    const updateTableHeight = () => {
      if (tableContainerRef.current) {
        const container = tableContainerRef.current;
        const style = window.getComputedStyle(container);
        const paddingTop = parseFloat(style.paddingTop);
        const paddingBottom = parseFloat(style.paddingBottom);
        const height = container.clientHeight - paddingTop - paddingBottom;
        setTableHeight(height);
      }
    };

    updateTableHeight();
    window.addEventListener('resize', updateTableHeight);
    return () => window.removeEventListener('resize', updateTableHeight);
  }, []);

  // Map order status to Ukrainian
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'В обробці',
      'in_progress': 'Розробляється',
      'completed': 'Виконано',
      'cancelled': 'Відхилено',
      'approved': 'Підтверджено',
      'rejected': 'Не підтверджено'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  // Map order status to color
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'чернетка': '#a8a8a8',
    'нове замовлення': '#4d4d4d',
    'очікує оплату': '#ff9900',
    'оплачено': '#0066cc',
    'прийнято': '#008000',
    'в черзі': '#4d4d4d',
    'в розробці': '#0066cc',
    'очікує підтвердження': '#ff9900',
    'призупинено': '#cc0000',
    'на перевірці': '#ff9900',
    'виконано': '#008000',
    'скасовано клієнтом': '#cc0000',
    'скасовано системою': '#cc0000',
    'відхилено': '#cc0000',
    'повернення коштів': '#cc0000',
    'повернено': '#cc0000',
    'архівовано': '#a8a8a8'
  };

  return colorMap[status.toLowerCase()] || '#4d4d4d';
};

// Determine action text based on status
const getActionText = (status: string): string => {
  const actionMap: Record<string, string> = {
    'чернетка': 'Редагувати',
    'нове замовлення': 'Переглянути',
    'очікує оплату': 'Переглянути',
    'оплачено': 'Переглянути',
    'прийнято': 'Переглянути',
    'в черзі': 'Переглянути',
    'в розробці': 'Переглянути',
    'очікує підтвердження': 'Підтвердити',
    'призупинено': 'Переглянути',
    'на перевірці': 'Перевірити',
    'виконано': 'Переглянути',
    'скасовано клієнтом': 'Переглянути',
    'скасовано системою': 'Переглянути',
    'відхилено': 'Переглянути',
    'повернення коштів': 'Переглянути',
    'повернено': 'Переглянути',
    'архівовано': 'Переглянути'
  };

  return actionMap[status.toLowerCase()] || 'Переглянути';
};

// Determine action button color based on status
const getActionColor = (status: string): string | undefined => {
  const statusLower = status.toLowerCase();

  // Highlight actions that require attention
  if (statusLower === 'очікує підтвердження' ||
      statusLower === 'на перевірці' ||
      statusLower === 'очікує оплату') {
    return '#ff7b00';
  }

  return undefined;
};

// Make action button bold for statuses requiring attention
const isActionBold = (status: string): boolean => {
  const statusLower = status.toLowerCase();

  return statusLower === 'очікує підтвердження' ||
         statusLower === 'на перевірці' ||
         statusLower === 'очікує оплату';
};

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format price for display
  const formatPrice = (price: any): string => {
    if (price === null || price === undefined || price === '') {
      return '-';
    }

    const priceNumber = typeof price === 'string' ? parseFloat(price) : price;

    if (typeof priceNumber !== 'number' || isNaN(priceNumber)) {
      return '-';
    }

    if (priceNumber <= 0) {
      return '-';
    }

    return `${priceNumber.toFixed(2)} грн`;
  };

  // Handle order action click
  const handleOrderAction = async (order: PersonalOrder) => {
    console.log('Order action clicked:', order);

    if (order.order_status.toLowerCase() === 'approved') {
      if (window.confirm('Підтвердити це замовлення?')) {
        try {
          await apiService.updatePersonalOrder(order.order_id, {
            orderStatus: 'in_progress'
          });

          alert('Замовлення підтверджено');
          // Force refresh to get updated data and clear cache
          forceRefreshOrders();
        } catch (error) {
          console.error('Failed to confirm order:', error);
          alert('Не вдалося підтвердити замовлення');
        }
      }
    } else {
      console.log('Viewing order details for:', order.order_id);
      // window.open(`/personal-orders/${order.order_id}`, '_blank');
    }
  };

  const handleCreateNewOrder = () => {
    console.log('Creating new order');
    // Clear cache when creating new order to ensure fresh data next time
    clearOrdersCache();
    // window.open('/personal-orders/new', '_blank');
  };

  const handleTermsClick = () => {
    console.log('Opening terms and policy');
    // window.open('/terms-and-policy', '_blank');
  };

  const handleRefreshClick = () => {
    forceRefreshOrders();
  };

  const getRowBg = (index: number) => index % 2 === 0 ? '#f2f2f2' : '#e6e6e6';

  const getEmptyRowsCount = () => {
    if (orders.length === 0) {return 0;}

    const rowHeight = 40;

    if (tableHeight > 0) {
      const availableHeight = tableHeight - rowHeight;
      const rowsThatFit = Math.floor(availableHeight / rowHeight);
      const emptyRowsNeeded = Math.max(0, rowsThatFit - orders.length);
      return emptyRowsNeeded;
    }

    return Math.max(0, 14 - orders.length);
  };

  const emptyRowsCount = getEmptyRowsCount();

  // Generate table data
  const generateTableData = () => {
    return [
      {
        header: 'Назва Замовлення',
        width: '38%',
        minWidth: '200px',
        cells: [
          ...orders.map((order, index) => (
            <TextCell
              key={`name-${order.order_id}`}
              text={order.order_title}
              bg={getRowBg(index)}
            />
          )),
          ...(emptyRowsCount > 0 ? Array.from({ length: emptyRowsCount }, (_, index) => (
            <EmptyCell
              key={`empty-name-${index}`}
              bg={getRowBg(orders.length + index)}
            />
          )) : [])
        ]
      },
      {
        header: 'Статус',
        width: '20%',
        minWidth: '120px',
        cells: [
          ...orders.map((order, index) => (
            <TextCell
              key={`status-${order.order_id}`}
              text={getStatusText(order.order_status)}
              bg={getRowBg(index)}
              bold={isActionBold(order.order_status)}
              color={getStatusColor(order.order_status)}
            />
          )),
          ...(emptyRowsCount > 0 ? Array.from({ length: emptyRowsCount }, (_, index) => (
            <EmptyCell
              key={`empty-status-${index}`}
              bg={getRowBg(orders.length + index)}
            />
          )) : [])
        ]
      },
      {
        header: 'Дата Замовлення',
        width: '20%',
        minWidth: '190px',
        cells: [
          ...orders.map((order, index) => (
            <TextCell
              key={`date-${order.order_id}`}
              text={formatDate(order.order_created_at)}
              bg={getRowBg(index)}
            />
          )),
          ...(emptyRowsCount > 0 ? Array.from({ length: emptyRowsCount }, (_, index) => (
            <EmptyCell
              key={`empty-date-${index}`}
              bg={getRowBg(orders.length + index)}
            />
          )) : [])
        ]
      },
      {
        header: 'Ціна',
        width: '12%',
        minWidth: '100px',
        cells: [
          ...orders.map((order, index) => (
            <TextCell
              key={`price-${order.order_id}`}
              text={formatPrice(order.order_price)}
              bg={getRowBg(index)}
            />
          )),
          ...(emptyRowsCount > 0 ? Array.from({ length: emptyRowsCount }, (_, index) => (
            <EmptyCell
              key={`empty-price-${index}`}
              bg={getRowBg(orders.length + index)}
            />
          )) : [])
        ]
      },
      {
        header: 'Дії',
        width: '10%',
        minWidth: '120px',
        cells: [
          ...orders.map((order, index) => (
            <TableCell
              key={`actions-${order.order_id}`}
              bg={getRowBg(index)}
            >
              <div className="flex flex-row items-center size-full">
                <div className="box-border content-stretch flex h-[40px] items-center px-[16px] py-[10px] relative w-full justify-center">
                  <div
                    onClick={() => handleOrderAction(order)}
                    className="flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <span
                      className={`${isActionBold(order.order_status) ? 'font-bold' : ''}`}
                      style={{ color: getActionColor(order.order_status) || '#4d4d4d' }}
                    >
                      {getActionText(order.order_status)}
                    </span>
                  </div>
                </div>
              </div>
            </TableCell>
          )),
          ...(emptyRowsCount > 0 ? Array.from({ length: emptyRowsCount }, (_, index) => (
            <EmptyCell
              key={`empty-action-${index}`}
              bg={getRowBg(orders.length + index)}
            />
          )) : [])
        ]
      }
    ];
  };

  // Loading state
  if (loading) {
    return (
      <div className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
        <div className="size-full">
          <div className="box-border content-stretch flex flex-col gap-[20px] items-start relative size-full overflow-hidden px-[24px] px-[20px] py-[16px]">
            {/* Scrolling Table */}
            <div className="basis-0 bg-[#f2f2f2] content-stretch flex gap-[8px] grow items-start min-h-px min-w-px overflow-clip relative shrink-0 w-full" data-name="Scrolling Table">
              {/* Table */}
              <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-auto" data-name="Table">
                <div className="flex items-center justify-center h-full">
                  <div className="text-[#4d4d4d] text-[18px]">Завантаження замовлень...</div>
                </div>
                <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
              </div>
            </div>

            {/* Bottom Row - Keep this */}
            <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0 w-full" data-name="row">
              <p className="[text-underline-position:from-font] [white-space-collapse:collapse] basis-0 decoration-solid font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] grow leading-[normal] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap underline cursor-pointer hover:text-[#5e89e8] transition-colors" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                Умови та Політика Використання
              </p>
              {/* Refresh button */}
              <button
                onClick={handleRefreshClick}
                className="bg-white box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-[#f2f2f2] transition-colors"
              >
                <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                  <p className="leading-[normal] whitespace-pre">Оновити</p>
                </div>
              </button>
              <div className="bg-white box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-[#f2f2f2] transition-colors" data-name="Button">
                <div aria-hidden="true" className="absolute border border-[#4d4d4d] border-solid inset-0 pointer-events-none rounded-[12px]" />
                <div className="relative shrink-0 size-[20px]" data-name="icon order">
                  <div className="absolute inset-[8.33%_4.17%_8.33%_12.5%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px_-2px] mask-size-[24px_24px]" data-name="contract_edit">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
                      <path d={iconPaths.contractEditSmall} fill="var(--fill-0, #0D0D0D)" id="contract_edit" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                  <p className="leading-[normal] whitespace-pre">Зробити нове замовлення</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
        <div className="size-full">
          <div className="box-border content-stretch flex flex-col gap-[20px] items-start relative size-full overflow-hidden px-[24px] px-[20px] py-[16px]">
            {/* Scrolling Table */}
            <div className="basis-0 bg-[#f2f2f2] content-stretch flex gap-[8px] grow items-start min-h-px min-w-px overflow-clip relative shrink-0 w-full" data-name="Scrolling Table">
              {/* Table */}
              <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-auto" data-name="Table">
                <div className="flex items-center justify-center h-full flex-col gap-2">
                  <div className="text-[#cc0000] text-[18px] text-center">{error}</div>
                  <button
                    onClick={() => loadPersonalOrders(true)}
                    className="bg-white px-4 py-2 rounded-md border border-[#4d4d4d] hover:bg-[#f2f2f2] transition-colors"
                  >
                    Спробувати знову
                  </button>
                </div>
                <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
              </div>
            </div>

            {/* Bottom Row - Keep this */}
            <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0 w-full" data-name="row">
              <p className="[text-underline-position:from-font] [white-space-collapse:collapse] basis-0 decoration-solid font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] grow leading-[normal] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap underline cursor-pointer hover:text-[#5e89e8] transition-colors" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                Умови та Політика Використання
              </p>
              <div className="bg-white box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-[#f2f2f2] transition-colors" data-name="Button">
                <div aria-hidden="true" className="absolute border border-[#4d4d4d] border-solid inset-0 pointer-events-none rounded-[12px]" />
                <div className="relative shrink-0 size-[20px]" data-name="icon order">
                  <div className="absolute inset-[8.33%_4.17%_8.33%_12.5%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px_-2px] mask-size-[24px_24px]" data-name="contract_edit">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
                      <path d={iconPaths.contractEditSmall} fill="var(--fill-0, #0D0D0D)" id="contract_edit" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                  <p className="leading-[normal] whitespace-pre">Зробити нове замовлення</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main return with proper layout
  return (
    <div className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-start relative size-full overflow-hidden px-[24px] px-[20px] py-[16px]">
          {/* Scrolling Table - Keep original structure but update content */}
          <div
            ref={tableContainerRef}
            className="basis-0 bg-[#f2f2f2] content-stretch flex gap-[8px] grow items-start min-h-px min-w-px overflow-clip relative shrink-0 w-full"
            data-name="Scrolling Table"
          >
            {/* Table - Updated to match purchase history style */}
            <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-auto" data-name="Table">
              <div className="content-stretch flex gap-[2px] items-start overflow-x-clip overflow-y-auto relative size-full rounded-[12px] w-full">
                {orders.length > 0 ? (
                  <Table columns={generateTableData()} />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <div className="text-[#4d4d4d] text-[18px] text-center">У вас ще немає замовлень</div>
                  </div>
                )}
              </div>
              <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
            </div>
          </div>

          {/* Bottom Row - Keep original structure */}
          <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0 w-full" data-name="row">
            <p
              onClick={handleTermsClick}
              className="[text-underline-position:from-font] [white-space-collapse:collapse] basis-0 decoration-solid font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] grow leading-[normal] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap underline cursor-pointer hover:text-[#5e89e8] transition-colors"
              style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
            >
              Умови та Політика Використання
            </p>
            {/* Refresh button */}
            <button
              onClick={handleRefreshClick}
              className="bg-white box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-[#f2f2f2] transition-colors border border-[#4d4d4d]"
            >
              <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                <p className="leading-[normal] whitespace-pre">Оновити</p>
              </div>
            </button>
            <div
              onClick={handleCreateNewOrder}
              className="bg-white box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-[#f2f2f2] transition-colors"
              data-name="Button"
            >
              <div aria-hidden="true" className="absolute border border-[#4d4d4d] border-solid inset-0 pointer-events-none rounded-[12px]" />
              <div className="relative shrink-0 size-[20px]" data-name="icon order">
                <div className="absolute inset-[8.33%_4.17%_8.33%_12.5%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px_-2px] mask-size-[24px_24px]" data-name="contract_edit">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
                    <path d={iconPaths.contractEditSmall} fill="var(--fill-0, #0D0D0D)" id="contract_edit" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                <p className="leading-[normal] whitespace-pre">Зробити нове замовлення</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
