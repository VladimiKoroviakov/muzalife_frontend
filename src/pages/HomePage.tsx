import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Canvas } from "../components/layout/Canvas";
import { Cart } from "../components/features/Cart";
import { LoginRequiredModal } from "../components/auth/LoginRequiredModal";
import { apiService } from "../services/api";
import { toast } from "sonner";
import { Product } from "../types";

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [bookmarkedProducts, setBookmarkedProducts] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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
        // If there's an error, start with empty cart
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

  // Check for authentication on mount and load saved products
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          console.log('No auth token found, skipping auth check');
          setIsAuthenticated(false);
          return;
        }

        const user = await apiService.getProfile();

        if (user) {
          console.log('User is authenticated on homepage load');
          setIsAuthenticated(true);
          await loadSavedProducts();
        } else {
          console.log('User is not authenticated on homepage load');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('User is not authenticated or token invalid:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const products = await apiService.getProducts();
        setAllProducts(products);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Не вдалося завантажити матеріали.');
        toast.error('Помилка завантаження матеріалів');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const loadSavedProducts = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const savedProducts = await apiService.getSavedProducts();
      setBookmarkedProducts(savedProducts);
    } catch (error) {
      console.error('Error loading saved products:', error);
      setBookmarkedProducts([]);
    }
  }, [isAuthenticated]);

  const toggleBookmark = async (productId: number) => {
    if (!isAuthenticated) {
      setShowLoginRequiredModal(true);
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
      
      // Refresh from API to ensure consistency
      const updatedSavedProducts = await apiService.getSavedProducts();
      setBookmarkedProducts(updatedSavedProducts);
      localStorage.setItem('savedProducts', JSON.stringify(updatedSavedProducts));
      
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      
      // Show error toast
      toast.error('Помилка при збереженні матеріалу', {
        duration: 3000,
      });
      
      // Revert optimistic update on error
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
    if (isAuthenticated) {
      loadSavedProducts();
    } else {
      setBookmarkedProducts([]);
    }
  }, [isAuthenticated]);

  const addToCart = (productId: number) => {
    setCartItems(prev => {
      if (!prev.includes(productId)) {
        const newCartItems = [...prev, productId];
        try {
          localStorage.setItem('cartItems', JSON.stringify(newCartItems));
        } catch (error) {
          console.error('Error updating cart in localStorage:', error);
        }
        return newCartItems;
      }
      return prev;
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => {
      const newCartItems = prev.filter(id => id !== productId);
      try {
        localStorage.setItem('cartItems', JSON.stringify(newCartItems));
      } catch (error) {
        console.error('Error updating cart in localStorage:', error);
      }
      return newCartItems;
    });
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  const clearFilters = () => {
    setSelectedAgeCategory(null);
    setSelectedEvents([]);
  };

  const handleLoginClick = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const user = await apiService.getProfile();
      console.log('Profile icon clicked. Is authenticated:', !!user);
      
      if (user) {
        console.log('Navigating to profile');
        navigate('/cabinet');
      } else {
        console.log('Navigating to login');
        navigate('/login');
      }
    } catch (error: any) {
      if (error.status === 401) {
        localStorage.removeItem('authToken');
      }
      console.log('User not authenticated, navigating to login');
      navigate('/login');
    }
  };

  const handleCardClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleLoginFromModal = () => {
    setShowLoginRequiredModal(false);
    navigate('/login');
  };

  const handleCancelFromModal = () => {
    setShowLoginRequiredModal(false);
  };

  const filteredProducts = allProducts.filter(product => {
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Tab filter
    if (activeTab === "scenarios" && product.type !== "Сценарій") return false;
    if (activeTab === "quests" && product.type !== "Квест") return false;
    if (activeTab === "poetry" && product.type !== "Поезія") return false;
    if (activeTab === "free" && product.type !== "Безкоштовні матеріали") return false;
    if (activeTab === "other" && product.type !== "Інше") return false;

    if (selectedAgeCategory) {
      const productAgeCategories = Array.isArray(product.ageCategory) 
        ? product.ageCategory 
        : [product.ageCategory];
      
      if (!productAgeCategories.includes(selectedAgeCategory)) {
        return false;
      }
    }

    // Events filter
    if (selectedEvents.length > 0) {
      const productEvents = Array.isArray(product.events) ? product.events : [];
      const hasEvent = productEvents.some(event => selectedEvents.includes(event));
      if (!hasEvent) return false;
    }

    return true;
  });

  return (
    <div className="bg-[#e6e6e6] relative size-full" data-name="Store Light">
      <div className="flex flex-col items-center max-w-inherit min-w-inherit size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-center max-w-inherit min-w-inherit px-[48px] py-[24px] relative size-full">
          <Header 
            cartCount={cartItems.length} 
            onCartClick={() => setShowCart(!showCart)}
            onHelpClick={() => navigate('/faqs')}
            onLoginClick={handleLoginClick}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {isLoading ? (
            <div className="flex-grow flex items-center justify-center text-lg">Завантаження...</div>
          ) : error ? (
            <div className="flex-grow flex items-center justify-center text-lg text-red-600">{error}</div>
          ) : (
            <Canvas
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              selectedAgeCategory={selectedAgeCategory}
              setSelectedAgeCategory={setSelectedAgeCategory}
              selectedEvents={selectedEvents}    
              toggleEvent={toggleEvent}
              clearFilters={clearFilters}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              products={filteredProducts}
              bookmarkedProducts={bookmarkedProducts}
              toggleBookmark={toggleBookmark}
              addToCart={addToCart}
              onCardClick={handleCardClick}
              cartItems={cartItems}
            />
          )}

          {showCart && (
            <Cart 
              cartItems={cartItems} 
              products={allProducts}
              onClose={() => setShowCart(false)} 
              onRemoveItem={removeFromCart} 
            />
          )}
        </div>
      </div>
      
      <LoginRequiredModal 
        open={showLoginRequiredModal}
        onOpenChange={setShowLoginRequiredModal}
        onLogin={handleLoginFromModal}
        onCancel={handleCancelFromModal}
      />
    </div>
  );
}