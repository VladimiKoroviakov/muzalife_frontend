import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { useAuthContext } from '../context/AuthContext';
import { Header } from "../components/cabinet/Header";
import { Canvas } from "../components/cabinet/Canvas";
import { useNavigate } from "react-router-dom";

export default function AdminPanel({ 
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
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  
  const { signOut, user } = useAuthContext();
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  const handleShowFAQ = () => {
    navigate('/faqs');
  };

  useEffect(() => {
    const loadProducts = async () => {
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

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        if (user?.name) {
          setUserName(user.name);
          setIsLoading(false);
        }

        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          try {
            const profile = JSON.parse(cachedProfile);
            if (profile.name && profile.name !== 'Користувач') {
              setUserName(profile.name);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            localStorage.removeItem('userProfile');
          }
        }

        const response = await apiService.getProfile();
        
        // Handle different response formats
        let profileData = null;
        
        if (response?.user) {
          profileData = response.user;
        } else if (response?.name) {
          profileData = response;
        } else if (response?.data) {
          profileData = response.data;
        }

        if (profileData?.name) {
          setUserName(profileData.name);
          
          // Cache the complete profile data in FLAT format
          const cacheData = {
            name: profileData.name,
            email: profileData.email || profileData.user_email,
            imageUrl: profileData.avatar_url || profileData.imageUrl || profileData.user_avatar_url,
          };
          localStorage.setItem('userProfile', JSON.stringify(cacheData));
        }
      } catch (error) {
        setUserName('Користувач');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('userProfile');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.clear();
      navigate('/');
    }
  };

  if (isLoading || productsLoading) {
    return (
      <div className="bg-[#e6e6e6] relative size-full flex items-center justify-center">
        <div className="text-lg">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#e6e6e6] relative size-full" data-name="Admin panel">
      <div className="flex flex-col items-center max-w-inherit min-w-inherit size-full">
        <div className="box-border content-stretch flex flex-col gap-[48px] items-center max-w-inherit min-w-inherit px-[48px] py-[24px] relative size-full">
          <Header 
            onBackClick={handleBackClick}
            activeSection={activeSection} 
            userName={userName} 
            onSectionChange={setActiveSection} 
          />
          <Canvas 
            onLogout={handleLogout}
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
            onShowFAQ={handleShowFAQ} 
            products={localProducts}
          />
        </div>
      </div>
    </div>
  );
}