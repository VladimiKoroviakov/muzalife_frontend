import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import ProductCard from "../ui/ProductCard";
import { apiService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { SavedScenariosContentProps } from "../../types";

export function SavedScenariosContent({ 
  onBack, 
  addToCart, 
  products = [], 
  onBookmarkedProductsChange 
}: SavedScenariosContentProps) {
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);
  const [savedProductIds, setSavedProductIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const navigate = useNavigate();

  // Load saved products from API
  useEffect(() => {
    const loadSavedProducts = async () => {
      try {
        setIsLoading(true);
        const savedIds = await apiService.getSavedProducts();
        setSavedProductIds(savedIds);
        onBookmarkedProductsChange?.(savedIds);
      } catch (error) {
        console.error('Error loading saved products:', error);
        toast.error('Помилка завантаження збережених матеріалів');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedProducts();
  }, [onBookmarkedProductsChange]);

  // Monitor when products are loaded
  useEffect(() => {
    if (products !== undefined) {
      setProductsLoading(false);
    }
  }, [products]);

  // Filter products to show only saved ones
  const savedMaterials = products ? products.filter(p => {
    // Handle both string and number IDs
    const productId = typeof p.id === 'string' ? parseInt(p.id, 10) : p.id;
    const isSaved = savedProductIds.includes(productId);
    return isSaved;
  }) : [];

  const handleConfirmRemove = async () => {
    if (itemToRemove !== null) {
      const productIdToRemove = itemToRemove;
      
      // Optimistically update UI
      const updatedSavedProducts = savedProductIds.filter(id => id !== productIdToRemove);
      setSavedProductIds(updatedSavedProducts);
      setItemToRemove(null);

      try {
        await apiService.unsaveProduct(productIdToRemove);
        toast.success('Матеріал видалено зі збережених');
      } catch (error) {
        console.error('Error removing saved product:', error);
        // Revert optimistic update on error
        setSavedProductIds(prev => [...prev, productIdToRemove]);
        toast.error('Помилка при видаленні матеріалу');
      }
    }
  };

  const handleCancelRemove = () => {
    setItemToRemove(null);
  };

  const handleAddToCartAndRemove = async (material: any) => {
    const productId = material.id;
    
    if (addToCart) {
      addToCart(productId);
    } else {
      const currentCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      if (!currentCartItems.includes(productId)) {
        const newCartItems = [...currentCartItems, productId];
        localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      }
    }
    
    try {
      const updatedSavedProducts = savedProductIds.filter(id => id !== productId);
      setSavedProductIds(updatedSavedProducts);
      await apiService.unsaveProduct(productId);
      onBookmarkedProductsChange?.(updatedSavedProducts);
      toast.success('Додано до кошика та видалено зі збережених');
    } catch (error) {
      console.error('Error removing saved product:', error);
      setSavedProductIds(prev => [...prev, productId]);
      toast.error('Помилка з\'єднання');
    }
  };

  const handleCardClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  // Show loading if products are still loading
  if (productsLoading && !products) {
    return (
      <div className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Завантаження продуктів...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Confirmation Modal */}
      {itemToRemove !== null && (
        <>
          <div 
            className="fixed inset-0 backdrop-blur-[10px] backdrop-filter bg-[rgba(0,0,0,0.4)] z-40" 
            onClick={handleCancelRemove}
            data-name="Blur layer" 
          />
          
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[16px] p-[32px] w-[480px] z-50 shadow-xl" data-name="Confirmation Modal">
            <div className="flex flex-col gap-[24px] items-center">
              <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[24px] text-center" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
                <p className="leading-[normal]">Видалити матеріал?</p>
              </div>
              
              <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#4d4d4d] text-[16px] text-center" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                <p className="leading-[24px]">Ви впевнені, що хочете видалити цей матеріал зі збережених?</p>
              </div>
              
              <div className="flex gap-[12px] w-full">
                <button 
                  onClick={handleCancelRemove}
                  className="basis-0 bg-white box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 grow cursor-pointer hover:bg-[#f9f9f9] transition-colors"
                  data-name="Cancel Button"
                >
                  <div aria-hidden="true" className="absolute border border-[#4d4d4d] border-solid inset-0 pointer-events-none rounded-[12px]" />
                  <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                    <p className="leading-[normal] whitespace-pre">Скасувати</p>
                  </div>
                </button>
                
                <button 
                  onClick={handleConfirmRemove}
                  className="basis-0 bg-[#E53935] box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 grow cursor-pointer hover:opacity-90 transition-opacity"
                  data-name="Confirm Button"
                >
                  <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] justify-end leading-[0] relative shrink-0 text-[16px] text-nowrap text-white" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
                    <p className="leading-[normal] whitespace-pre">Видалити</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
        <div className="size-full">
          <div className="box-border content-stretch flex flex-wrap gap-[24px] items-start relative size-full px-[24px] px-[20px] py-[16px]">
            <div className="basis-0 content-stretch flex gap-[12px] grow h-full items-start min-h-px min-w-px relative shrink-0" data-name="Scrolling">
              <div className="basis-0 content-start flex flex-wrap gap-[24px] grow h-full items-start rounded-tl-[12px] rounded-tr-[12px] min-h-px min-w-px overflow-x-clip overflow-y-auto relative shrink-0 px-[0px] p-[0px]" data-name="Scroll">
                {isLoading ? (
                  // Loading skeletons
                  <>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="min-h-px relative rounded-[16px] shrink-0 w-[calc(33.333%-16px)]">
                        <Skeleton className="h-[350px] w-full rounded-[16px]" />
                      </div>
                    ))}
                  </>
                ) : savedMaterials.length === 0 ? (
                  // Empty state
                  <div className="flex flex-col items-center justify-center w-full h-full gap-4 py-12">
                    <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative text-[#4d4d4d] text-[18px] text-center" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                      <p className="leading-[normal]">
                        {savedProductIds.length > 0 && products 
                          ? 'Збережені матеріали не знайдені серед доступних продуктів'
                          : 'Ви ще не зберегли жодних матеріалів'
                        }
                      </p>
                    </div>
                    {savedProductIds.length > 0 && products && (
                      <div className="text-sm text-gray-500 text-center">
                        <div>Збережені ID: {savedProductIds.join(', ')}</div>
                        <div>Доступні ID: {products.map(p => p.id).join(', ')}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  savedMaterials.map((material) => (
                    <div key={material.id} className="min-h-px relative rounded-[16px] shrink-0 w-[calc(33.333%-16px)]">
                      <ProductCard
                        id={material.id}
                        title={material.title}
                        price={material.price}
                        rating={material.rating}
                        image={material.image}
                        badgeText={material.type}
                        showDelete={true}
                        showBookmark={false}
                        onDeleteClick={() => setItemToRemove(material.id)}
                        onCartClick={() => handleAddToCartAndRemove(material)}
                        onClick={() => handleCardClick(material.id)} 
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}