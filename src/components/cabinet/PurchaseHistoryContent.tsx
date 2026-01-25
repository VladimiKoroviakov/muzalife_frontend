import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import svgPaths from "../ui/icons/svgIconPaths";
import { Table, TextCell, EmptyCell, TableCell } from "./TableComponents";
import { Skeleton } from "../ui/skeleton";
import { apiService } from "../../services/api";
import { Order, BoughtScenariosContentProps, Product } from "../../types";
import ReviewScreen from "./ReviewScreen";
import { CacheManager } from "../../utils/cache-manager";
import config from "../../config";

export function PurchaseHistoryContent({
  onBack,
  products = []
}: BoughtScenariosContentProps) {
  const [showReviewScreen, setShowReviewScreen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewedProducts, setReviewedProducts] = useState<Set<number>>(new Set());
  const [boughtProductIds, setBoughtProductIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState<number>(0);

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Невідома дата';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Load user reviews with cache-first approach
  const loadUserReviews = useCallback(async () => {
    try {
      const cacheKey = config.cacheKeys.REVIEWED_PRODUCTS;
      const timestampKey = `${config.cacheKeys.REVIEWED_PRODUCTS}_timestamp`;
      const cachedProductIds = CacheManager.getItem<number[]>(cacheKey);
      const cacheTimestamp = CacheManager.getItem<number>(timestampKey);
      const isCacheValid = cacheTimestamp && Date.now() - cacheTimestamp < 60 * 60 * 1000;
      
      if (cachedProductIds && isCacheValid) {
        setReviewedProducts(new Set(cachedProductIds));
        return;
      }
      
      const userProfile = await apiService.getProfile();
      if (!userProfile?.id) {
        throw new Error('User not authenticated');
      }
      
      try {
        const reviews = await apiService.getUserReviews(userProfile.id);
        const reviewedProductIds = reviews.map(review => review.productId);
        
        // Update state
        setReviewedProducts(new Set(reviewedProductIds));
        
        // Update cache
        CacheManager.setItem(cacheKey, reviewedProductIds);
        CacheManager.setItem(timestampKey, Date.now());
        
      } catch (apiError: any) {
        console.error('API error loading user reviews:', apiError);
        
        // If API fails, use cached data even if expired
        if (cachedProductIds) {
          setReviewedProducts(new Set(cachedProductIds));
        } else {
          // No cache available, use empty set
          setReviewedProducts(new Set());
        }
        
        // Update timestamp to prevent immediate retry
        CacheManager.setItem(timestampKey, Date.now());
      }
      
    } catch (error) {
      console.error('Error in loadUserReviews:', error);
      // Final fallback to any available cache
      const cachedProductIds = CacheManager.getItem<number[]>(config.cacheKeys.REVIEWED_PRODUCTS);
      if (cachedProductIds) {
        setReviewedProducts(new Set(cachedProductIds));
      }
    }
  }, []);

  // Load bought product IDs
  useEffect(() => {
    const loadBoughtProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check cache first
        const cachedBoughtProducts = CacheManager.getItem<number[]>(config.cacheKeys.BOUGHT_PRODUCTS);
        if (cachedBoughtProducts) {
          setBoughtProductIds(cachedBoughtProducts);
        }
        
        // Always fetch fresh data
        const boughtIds = await apiService.getBoughtProducts();
        setBoughtProductIds(boughtIds);
        
      } catch (error) {
        console.error('Error loading bought products:', error);
        setError('Не вдалося завантажити історію покупок');
        toast.error('Помилка завантаження історії покупок');
      } finally {
        setIsLoading(false);
      }
    };

    loadBoughtProducts();
  }, []);

  // Load user reviews when bought products are loaded
  useEffect(() => {
    if (boughtProductIds.length > 0 && !isLoading) {
      loadUserReviews();
    }
  }, [boughtProductIds, isLoading, loadUserReviews]);

  // Monitor when products are loaded
  useEffect(() => {
    setProductsLoading(false);
  }, [products]);

  // Calculate table height
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

  // Filter products to show only bought ones
  const boughtMaterials = products.filter(p => {
    const productId = typeof p.id === 'string' ? parseInt(p.id, 10) : Number(p.id);
    return boughtProductIds.includes(productId);
  });

  // Transform bought materials to orders format
  const orders: Order[] = boughtMaterials.map(material => ({
    id: Number(material.id),
    name: material.title || 'Невідомий матеріал',
    date: formatDate(material.bought_at || material.orderDate || material.createdAt || new Date().toISOString()),
    materialType: material.type || 'Не вказано'
  }));

  const getRowBg = (index: number) => index % 2 === 0 ? '#f2f2f2' : '#e6e6e6';

  const getEmptyRowsCount = () => {
    if (orders.length === 0) return 0;
    
    const rowHeight = 40;
    
    if (tableHeight > 0) {
      const availableHeight = tableHeight - rowHeight;
      const rowsThatFit = Math.floor(availableHeight / rowHeight);
      const emptyRowsNeeded = Math.max(0, rowsThatFit - orders.length);
      return emptyRowsNeeded;
    }
    
    return Math.max(0, 13 - orders.length);
  };

  const emptyRowsCount = getEmptyRowsCount();

  const handleResendMaterial = async (materialName: string, purchaseDate: string) => {
    try {
      const order = orders.find(o => o.name === materialName && o.date === purchaseDate);
      if (order) {
        toast.success(`Матеріал "${materialName}" буде відправлено на вашу email адресу`);
      } else {
        toast.error('Не вдалося знайти замовлення');
      }
    } catch (error) {
      console.error('Error resending material:', error);
      toast.error('Помилка при відправці матеріалу');
    }
  };

  const handleOpenReview = (order: Order) => {
    // Check if product is already reviewed
    if (reviewedProducts.has(order.id)) {
      toast.error('Ви вже залишили відгук', {
        description: 'Ви можете залишити лише один відгук на цей матеріал'
      });
      return;
    }
    
    setSelectedOrder(order);
    setShowReviewScreen(true);
  };

  const handleCloseReview = () => {
    setShowReviewScreen(false);
    setSelectedOrder(null);
  };

  const handleSubmitReview = async (rating: number, reviewText: string) => {
    try {
      if (!selectedOrder) return;
      
      // Submit review via API
      await apiService.submitReview(
        selectedOrder.id,
        rating,
        reviewText
      );
      
      toast.success('Відгук успішно надіслано!');
      
      // Update local state
      const updatedReviewedProducts = new Set([...reviewedProducts, selectedOrder.id]);
      setReviewedProducts(updatedReviewedProducts);
      
      // Update cache immediately
      const cacheKey = config.cacheKeys.REVIEWED_PRODUCTS;
      const timestampKey = `${config.cacheKeys.REVIEWED_PRODUCTS}_timestamp`;
      
      const currentCache = CacheManager.getItem<number[]>(cacheKey) || [];
      if (!currentCache.includes(selectedOrder.id)) {
        const updatedCache = [...currentCache, selectedOrder.id];
        CacheManager.setItem(cacheKey, updatedCache);
        CacheManager.setItem(timestampKey, Date.now());
      }
      
      handleCloseReview();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Помилка при відправці відгуку');
      throw error; 
    }
  };

  // Generate table data
  const tableColumns = orders.length > 0 && !isLoading && !productsLoading ? [
    {
      header: "Назва матеріалу",
      width: "50%",
      minWidth: "200px",
      cells: [
        ...orders.map((order, index) => (
          <TextCell 
            key={`name-${order.id}`}
            text={order.name}
            bg={getRowBg(index)}
          />
        )),
        ...Array.from({ length: emptyRowsCount }, (_, index) => (
          <EmptyCell 
            key={`empty-name-${index}`} 
            bg={getRowBg(orders.length + index)}
          />
        ))
      ]
    },
    {
      header: "Тип матеріалу",
      width: "25%",
      minWidth: "100px",
      cells: [
        ...orders.map((order, index) => (
          <TextCell 
            key={`type-${order.id}`}
            text={order.materialType || 'Не вказано'}
            bg={getRowBg(index)}
            color="#4d4d4d"
          />
        )),
        ...Array.from({ length: emptyRowsCount }, (_, index) => (
          <EmptyCell 
            key={`empty-type-${index}`} 
            bg={getRowBg(orders.length + index)}
          />
        ))
      ]
    },
    {
      header: "Дата покупки",
      width: "15%",
      minWidth: "100px",
      cells: [
        ...orders.map((order, index) => (
          <TextCell 
            key={`date-${order.id}`}
            text={order.date}
            bg={getRowBg(index)}
            color="#4d4d4d"
          />
        )),
        ...Array.from({ length: emptyRowsCount }, (_, index) => (
          <EmptyCell 
            key={`empty-date-${index}`} 
            bg={getRowBg(orders.length + index)}
          />
        ))
      ]
    },
    {
      header: "Дії",
      width: "10%",
      minWidth: "100px",
      cells: [
        ...orders.map((order, index) => {
          const isReviewed = reviewedProducts.has(order.id);
          
          return (
            <TableCell 
              key={`actions-${order.id}`} 
              bg={getRowBg(index)}
            >
              <div className="flex flex-row items-center size-full">
                <div className="box-border content-stretch flex gap-[16px] h-[40px] items-center px-[16px] py-[10px] relative w-full">
                  <div 
                    onClick={() => handleResendMaterial(order.name, order.date)}
                    className="relative shrink-0 size-[24px] cursor-pointer hover:opacity-70 transition-opacity" 
                    data-name="icon download"
                    title="Повторно надіслати матеріал"
                  >
                    <div className="absolute inset-[16.667%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-4px] mask-size-[24px_24px]" data-name="download">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                        <path d={svgPaths.p13494900} fill="var(--fill-0, #0D0D0D)" id="download" />
                      </svg>
                    </div>
                  </div>
                  <div 
                    onClick={() => handleOpenReview(order)}
                    className={`relative shrink-0 size-[24px] transition-opacity ${
                      isReviewed
                        ? 'opacity-30 cursor-not-allowed'
                        : 'cursor-pointer hover:opacity-70'
                    }`}
                    data-name="comment"
                    title={isReviewed ? "Ви вже залишили відгук" : "Залишити відгук"}
                  >
                    <div className="absolute inset-[8.333%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2px] mask-size-[24px_24px]" data-name="comment">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                        <path d={svgPaths.p159e6480} fill="var(--fill-0, #4D4D4D)" id="comment" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </TableCell>
          );
        }),
        ...Array.from({ length: emptyRowsCount }, (_, index) => (
          <EmptyCell 
            key={`empty-actions-${index}`} 
            bg={getRowBg(orders.length + index)}
          />
        ))
      ]
    }
  ] : null;

  // Show loading if products are still loading
  if (productsLoading && products.length === 0 && boughtProductIds.length > 0) {
    return (
      <div className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Завантаження даних продуктів...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="basis-0 content-stretch flex flex-col gap-[10px] grow h-full items-start min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
      {/* Conditionally render ReviewScreen or the Purchase History table */}
      {showReviewScreen && selectedOrder ? (
        <ReviewScreen 
          materialName={selectedOrder.name}
          onClose={handleCloseReview}
          onSubmit={handleSubmitReview}
        />
      ) : (
        <div 
          ref={tableContainerRef}
          className="bg-[#f2f2f2] box-border content-stretch flex gap-[12px] grow h-full w-full items-start overflow-clip px-[24px] relative rounded-[16px] shrink-0 px-[20px] py-[16px]" 
          data-name="Scrolling Table"
        >
          {isLoading ? (
            // Loading state - show skeletons
            <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden w-full flex items-center justify-center">
              <div className="flex flex-col items-center justify-center w-full h-full gap-4">
                <div className="text-lg">Завантаження історії покупок...</div>
                <div className="space-y-4 w-full max-w-2xl">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-16 w-full rounded-[12px]" />
                  ))}
                </div>
              </div>
            </div>
          ) : error ? (
            // Error state
            <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden w-full flex items-center justify-center">
              <div className="flex flex-col items-center justify-center w-full h-full gap-4 py-12">
                <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative text-[#4d4d4d] text-[18px] text-center" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                  <p className="leading-[normal]">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          ) : boughtProductIds.length === 0 ? (
            // Empty state - no purchase history
            <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden w-full flex items-center justify-center">
              <div className="flex flex-col items-center justify-center w-full h-full gap-4 py-12">
                <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative text-[#4d4d4d] text-[18px] text-center" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                  <p className="leading-[normal]">
                    Ви ще не здійснили жодної покупки
                  </p>
                </div>
              </div>
            </div>
          ) : orders.length === 0 ? (
            // Edge case: bought products exist but not found in available products
            <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden w-full flex items-center justify-center">
              <div className="flex flex-col items-center justify-center w-full h-full gap-4 py-12">
                <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative text-[#4d4d4d] text-[18px] text-center" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                  <p className="leading-[normal]">
                    Куплені матеріали не знайдені серед доступних продуктів
                  </p>
                </div>
                {boughtProductIds.length > 0 && products.length > 0 && (
                  <div className="text-sm text-gray-500 text-center">
                    <div>Куплені ID: {boughtProductIds.join(', ')}</div>
                    <div>Доступні ID: {products.map(p => p.id).join(', ')}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Show table only when we have orders and not loading
            <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden w-full" data-name="Table">
              <div className="content-stretch flex gap-[2px] items-start overflow-x-clip overflow-y-auto relative size-full rounded-[12px] w-full">
                {tableColumns && <Table columns={tableColumns} />}
              </div>
              <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}