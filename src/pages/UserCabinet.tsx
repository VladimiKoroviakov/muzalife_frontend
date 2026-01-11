import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { useAuthContext } from '../context/AuthContext';
import { Header } from "../components/cabinet/Header";
import { Canvas } from "../components/cabinet/Canvas";
import FAQs from "./FAQsPage";

export default function UserCabinet({ 
  onBackClick, 
  addToCart, 
  products, 
  onBookmarkedProductsChange 
}: { 
  onBackClick?: () => void; 
  addToCart?: (productId: number) => void; 
  products?: any[]; 
  onBookmarkedProductsChange?: (products: number[]) => void; 
}) {
  const [activeSection, setActiveSection] = useState<string>('main');
  const [showFAQ, setShowFAQ] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  
  const { signOut, user } = useAuthContext();

  const handleBackClick = onBackClick || (() => {
    window.location.href = '/';
  });

  // Load products if not provided as prop
  useEffect(() => {
    const loadProducts = async () => {
      if (products && products.length > 0) {
        // Use provided products
        setLocalProducts(products);
        setProductsLoading(false);
        return;
      }
      
      try {
        setProductsLoading(true);
        const productsData = await apiService.getProducts(); 
        setLocalProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
        const cached = localStorage.getItem('cachedProducts');
        if (cached) {
          try {
            const parsedProducts = JSON.parse(cached);
            setLocalProducts(parsedProducts);
          } catch (e) {
            console.error('Error parsing cached products:', e);
          }
        }
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, [products]);

  // Load user profile
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setIsLoading(true);

      try {
        // Prefer auth context (fast path)
        if (user?.name) {
          if (isMounted) setUserName(user.name);
          return;
        }

        // Prefer cached profile
        const cached = getCachedProfile();
        if (cached?.name) {
          if (isMounted) setUserName(cached.name);
          return;
        }

        // Fetch from API (guaranteed ONE shape)
        const profile = await apiService.getProfile();

        if (isMounted) {
           setUserName(profile.name);

          const userProfileToStore = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatar_url: profile.avatar_url,
            auth_provider: profile.auth_provider,
          };

          localStorage.setItem('userProfile', JSON.stringify(userProfileToStore));
        }

      } catch (error) {
        if (isMounted) setUserName(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const getCachedProfile = () => {
    try {
      const raw = localStorage.getItem('userProfile');
      if (!raw) return null;

      const profile = JSON.parse(raw);
      if (!profile.name || profile.name === 'Користувач') return null;

      return profile;
    } catch {
      localStorage.removeItem('userProfile');
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all cached data on logout
      localStorage.removeItem('userProfile');
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.clear();
      window.location.href = '/';
    }
  };

  if (showFAQ) {
    return <FAQs />;
  }

  if (isLoading || productsLoading) {
    return (
      <div className="bg-[#e6e6e6] relative size-full flex items-center justify-center">
        <div className="text-lg">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#e6e6e6] relative size-full" data-name="User Cabinet">
      <div className="flex flex-col items-center max-w-inherit min-w-inherit size-full">
        <div className="box-border content-stretch flex flex-col gap-[48px] items-center max-w-inherit min-w-inherit px-[48px] py-[24px] relative size-full">
          <Header 
            onBackClick={handleBackClick}
            activeSection={activeSection} 
            userName={userName ?? 'Користувач'} 
            onSectionChange={setActiveSection} 
          />
          <Canvas 
            onLogout={handleLogout}
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
            addToCart={addToCart} 
            onShowFAQ={() => setShowFAQ(true)} 
            products={localProducts}
            onBookmarkedProductsChange={onBookmarkedProductsChange} 
          />
        </div>
      </div>
    </div>
  );
}