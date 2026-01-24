import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductHeader } from "../components/product/ProductHeader";
import { ProductGallery } from "../components/product/ProductGallery";
import { ProductInfo } from "../components/product/ProductInfo";
import { ImageViewer } from "../components/product/ImageViewer";
import { Cart } from "../components/features/Cart";
import { useSingleProduct } from '../hooks/useSingleProduct';
import { apiService } from "../services/api";
import { LoginRequiredModal } from "../components/auth/LoginRequiredModal";
import { toast } from "sonner";

export default function SingleProductPage() {
  const { id } = useParams<{ id: string }>();
  const { 
    product, 
    reviews, 
    galleryImages, 
    loading, 
    error, 
    refetch 
  } = useSingleProduct(id);
  
  const [activeTab, setActiveTab] = useState("description");
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [bookmarkedProducts, setBookmarkedProducts] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<number[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const navigate = useNavigate();

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const loadCartItems = () => {
      try {
        const savedCartItems = localStorage.getItem('cartItems');
        if (savedCartItems) {
          const parsedItems = JSON.parse(savedCartItems);
          if (Array.isArray(parsedItems)) {
            setCartItems(parsedItems);
          }
        }
      } catch (error) {
        console.error('Error loading cart items from localStorage:', error);
        setCartItems([]);
      }
    };

    loadCartItems();
  }, []);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    const saveCartItems = () => {
      try {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart items to localStorage:', error);
      }
    };

    saveCartItems();
  }, [cartItems]);

  // Check authentication on mount and load saved products
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setIsAuthenticated(false);
          await loadSavedProducts();
          return;
        }

        const user = await apiService.getProfile();
        setIsAuthenticated(!!user);
        
        if (user) {
          await loadSavedProducts();
        } else {
          localStorage.removeItem('authToken');
          await loadSavedProducts();
        }
      } catch (error) {
        console.log('User is not authenticated:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        await loadSavedProducts();
      }
    };
    
    checkAuth();
  }, []);

  // Load saved products from localStorage and API
  const loadSavedProducts = useCallback(async () => {
    if (!isAuthenticated) {
      try {
        const savedFromStorage = localStorage.getItem('savedProducts');
        if (savedFromStorage) {
          const parsed = JSON.parse(savedFromStorage);
          if (Array.isArray(parsed)) {
            setBookmarkedProducts(parsed);
          }
        } else {
          setBookmarkedProducts([]);
        }
      } catch (error) {
        console.error('Error loading saved products from localStorage:', error);
        setBookmarkedProducts([]);
      }
      return;
    }
    
    try {
      const savedProducts = await apiService.getSavedProducts();
      setBookmarkedProducts(savedProducts);
      localStorage.setItem('savedProducts', JSON.stringify(savedProducts));
    } catch (error) {
      console.error('Error loading saved products from API:', error);
      try {
        const savedFromStorage = localStorage.getItem('savedProducts');
        if (savedFromStorage) {
          const parsed = JSON.parse(savedFromStorage);
          if (Array.isArray(parsed)) {
            setBookmarkedProducts(parsed);
          }
        }
      } catch (storageError) {
        console.error('Error loading from localStorage fallback:', storageError);
        setBookmarkedProducts([]);
      }
    }
  }, [isAuthenticated]);

  // Listen for storage changes to sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cartItems' && e.newValue) {
        try {
          const newCartItems = JSON.parse(e.newValue);
          if (Array.isArray(newCartItems)) {
            setCartItems(newCartItems);
          }
        } catch (error) {
          console.error('Error parsing cartItems from storage event:', error);
        }
      }
      
      if (e.key === 'savedProducts' && e.newValue) {
        try {
          const newSavedProducts = JSON.parse(e.newValue);
          if (Array.isArray(newSavedProducts)) {
            setBookmarkedProducts(newSavedProducts);
          }
        } catch (error) {
          console.error('Error parsing savedProducts from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add to cart functionality - automatically remove from saved if it was saved
  const addToCart = (productId: number) => {
    setCartItems(prev => {
      if (!prev.includes(productId)) {
        const newCartItems = [...prev, productId];
        try {
          localStorage.setItem('cartItems', JSON.stringify(newCartItems));
          
          // If product was saved, remove it from saved
          if (bookmarkedProducts.includes(productId)) {
            const newSavedProducts = bookmarkedProducts.filter(id => id !== productId);
            setBookmarkedProducts(newSavedProducts);
            localStorage.setItem('savedProducts', JSON.stringify(newSavedProducts));
            
            // If authenticated, also remove from API
            if (isAuthenticated) {
              apiService.unsaveProduct(productId).catch(console.error);
            }
            
            toast.success('Матеріал додано до кошика та видалено зі збережених', {
              duration: 3000,
            });
          } else {
            toast.success('Матеріал додано до кошика', {
              duration: 3000,
            });
          }
        } catch (error) {
          console.error('Error updating cart in localStorage:', error);
        }
        return newCartItems;
      } else {
        toast.info('Матеріал вже в кошику', {
          duration: 3000,
        });
      }
      return prev;
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => {
      const newCartItems = prev.filter(id => id !== productId);
      try {
        localStorage.setItem('cartItems', JSON.stringify(newCartItems));
        toast.success('Матеріал видалено з кошика', {
          duration: 3000,
        });
      } catch (error) {
        console.error('Error updating cart in localStorage:', error);
      }
      return newCartItems;
    });
  };

  const toggleBookmark = async (productId: number) => {
    if (!isAuthenticated) {
      setShowLoginRequiredModal(true);
      return;
    }

    if (cartItems.includes(productId)) {
      toast.info('Товар вже в кошику. Неможливо додати до збережених.', {
        duration: 3000,
      });
      return;
    }

    try {
      const isCurrentlyBookmarked = bookmarkedProducts.includes(productId);

      const newBookmarkedProducts = isCurrentlyBookmarked 
        ? bookmarkedProducts.filter(id => id !== productId)
        : [...bookmarkedProducts, productId];
      
      setBookmarkedProducts(newBookmarkedProducts);
      localStorage.setItem('savedProducts', JSON.stringify(newBookmarkedProducts));
      
      if (isCurrentlyBookmarked) {
        toast.success('Матеріал видалено зі збережених', {
          duration: 3000,
        });
      } else {
        toast.success('Матеріал додано до збережених', {
          duration: 3000,
        });
      }
      
      if (isCurrentlyBookmarked) {
        await apiService.unsaveProduct(productId);
      } else {
        await apiService.saveProduct(productId);
      }
      
      const updatedSavedProducts = await apiService.getSavedProducts();
      setBookmarkedProducts(updatedSavedProducts);
      localStorage.setItem('savedProducts', JSON.stringify(updatedSavedProducts));
      
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Помилка при збереженні матеріалу', {
        duration: 3000,
      });
      
      try {
        const savedProducts = await apiService.getSavedProducts();
        setBookmarkedProducts(savedProducts);
        localStorage.setItem('savedProducts', JSON.stringify(savedProducts));
      } catch (fallbackError) {
        await loadSavedProducts();
      }
    }
  };

  useEffect(() => {
    loadSavedProducts();
  }, [isAuthenticated, loadSavedProducts]);

  useEffect(() => {
    if (product && galleryImages.length > 0) {
      setMainImageIndex(0);
      setSliderIndex(0);
      setCurrentImageIndex(0);
    }
  }, [product, galleryImages]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleImageClick = () => {
    if (galleryImages.length > 0) {
      setCurrentImageIndex(mainImageIndex);
      setIsViewerOpen(true);
    }
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
  };

  const handleSliderNext = () => {
    const newSliderIndex = (sliderIndex + 1) % galleryImages.length;
    setSliderIndex(newSliderIndex);
    const newMainImageIndex = newSliderIndex;
    setMainImageIndex(newMainImageIndex);
  };

  const handleSliderPrevious = () => {
    const newSliderIndex = (sliderIndex - 1 + galleryImages.length) % galleryImages.length;
    setSliderIndex(newSliderIndex);
    const newMainImageIndex = newSliderIndex;
    setMainImageIndex(newMainImageIndex);
  };

  const handleThumbnailClick = (clickedIndex: number) => {
    setSliderIndex(clickedIndex);
    setMainImageIndex(clickedIndex);
  };

  const handleLoginFromModal = () => {
    setShowLoginRequiredModal(false);
    navigate('/login');
  };

  const handleCancelFromModal = () => {
    setShowLoginRequiredModal(false);
  };

  const currentMainImage = galleryImages.length > 0 ? galleryImages[mainImageIndex] : '';
  const isProductBookmarked = product ? bookmarkedProducts.includes(product.id) : false;
  const isProductInCart = product ? cartItems.includes(product.id) : false;
  
  // Check if product can be bookmarked (not in cart)
  const canBookmark = !isProductInCart;

  // Loading state
  if (loading) {
    return (
      <div className="bg-[#e6e6e6] flex items-center justify-center min-h-screen">
        <div className="text-[#4d4d4d] text-[18px]">Завантаження...</div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="bg-[#e6e6e6] flex items-center justify-center min-h-screen h-full">
        <div className="text-[#4d4d4d] text-[18px] text-center flex flex-col gap-4">
          {error || 'Продукт не знайдено'}
          <div className="flex justify-between gap-4">
            <button 
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-[#5e89e8] text-white rounded-[12px] hover:bg-[#4a76d6] transition-colors"
            >
              На головну
            </button>
            <button 
              onClick={refetch}
              className="mt-4 ml-4 px-6 py-2 bg-[#5e89e8] text-white rounded-[12px] hover:bg-[#4a76d6] transition-colors"
            >
              Спробувати ще раз
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#e6e6e6] relative size-full" data-name="Single scenario page">
      <div className="flex flex-col items-center max-w-inherit min-w-inherit size-full">
        <div className="box-border content-stretch flex flex-col gap-[40px] items-center max-w-inherit min-w-inherit px-[48px] py-[24px] relative size-full">
          <ProductHeader 
            onClose={handleClose}
          />
          
          <div className="basis-0 content-stretch flex gap-[12px] grow items-start max-w-[1280px] min-h-px min-w-px relative rounded-[16px] shrink-0 w-full" data-name="Canvas">
            <ProductGallery 
              onImageClick={handleImageClick}
              sliderIndex={sliderIndex}
              onSliderPrevious={handleSliderPrevious}
              onSliderNext={handleSliderNext}
              currentMainImage={currentMainImage}
              onThumbnailClick={handleThumbnailClick}
              galleryImages={galleryImages}
              product={product}
            />
            
            <ProductInfo 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              product={product} 
              reviews={reviews}
              isBookmarked={isProductBookmarked}
              onToggleBookmark={() => product && toggleBookmark(product.id)}
              isInCart={isProductInCart}
              onAddToCart={() => product && addToCart(product.id)}
              onRemoveFromCart={() => product && removeFromCart(product.id)}
              canBookmark={canBookmark}
            />
          </div>
        </div>
      </div>

      {galleryImages.length > 0 && (
        <ImageViewer 
          isOpen={isViewerOpen}
          onClose={handleCloseViewer}
          currentImageIndex={currentImageIndex}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
          galleryImages={galleryImages}
          product={product}
        />
      )}

      {showCart && (
        <Cart 
          cartItems={cartItems} 
          products={[product]} 
          onClose={() => setShowCart(false)} 
          onRemoveItem={removeFromCart} 
        />
      )}

      <LoginRequiredModal 
        open={showLoginRequiredModal}
        onOpenChange={setShowLoginRequiredModal}
        onLogin={handleLoginFromModal}
        onCancel={handleCancelFromModal}
      />
    </div>
  );
}