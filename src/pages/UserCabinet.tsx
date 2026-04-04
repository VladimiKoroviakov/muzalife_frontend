import { useState, useEffect } from 'react';

// Services & context
import { apiService } from '../services/api';
import { useAuthContext } from '../context/AuthContext';

// Layout components & icons
import { iconPaths } from '../components/ui/icons/iconPaths';
import { DashboardCanvas } from '../components/layout/dashboard/DashboardCanvas';
import { SidebarTabs } from '../components/layout/SidebarTabs';

// Cabinet components
import { DashboardHeader } from '../components/layout/dashboard/DashboardHeader';
import { DashboardRightSide } from '../components/layout/dashboard/DashboardRightSide';
import { PurchaseHistoryContent, SavedScenariosContent, PersonalOrdersContent, QuestionnairesContent } from '../components/cabinet';
import { SettingsContent } from '../components/layout/dashboard/SettingsContent';
import FAQs from './FAQsPage';

// Types
import { TabItem, DashboardCard } from '../types/ui';

const USER_RIGHT_CARDS: DashboardCard[] = [
  { id: 'history',        label: 'Історія замовлень',           path: iconPaths.workHistoryCard,    viewBox: '0 0 70 70', iconSize: 80, padding: 'px-[24px] py-[16px]' },
  { id: 'saved',          label: 'Збережені матеріали',          path: iconPaths.bookmarksCard,      viewBox: '0 0 54 67', iconSize: 80, padding: 'px-[24px] py-[16px]' },
  { id: 'orders',         label: 'Персональні замовлення',       path: iconPaths.contractEditCard,   viewBox: '0 0 54 54', iconSize: 80, padding: 'px-[24px] py-[16px]' },
  { id: 'questionnaires', label: 'Опитування для користувачів', path: iconPaths.barChartCard,       viewBox: '0 0 43 43', iconSize: 80, padding: 'p-[10px]' },
];

const USER_TABS: TabItem[] = [
  { id: 'main',           label: 'Головна',                  path: iconPaths.homeTab,          viewBox: '0 0 14 15'  },
  { id: 'history',        label: 'Історія замовлень',         path: iconPaths.workHistoryTab,   viewBox: '0 0 16 16'  },
  { id: 'saved',          label: 'Збережені матеріали',        path: iconPaths.bookmarksTab,     viewBox: '0 0 12 15'  },
  { id: 'orders',         label: 'Персональні замовлення',     path: iconPaths.contractEditTab,  viewBox: '0 0 15 15'  },
  { id: 'questionnaires', label: 'Опитування',                path: iconPaths.barChartTab,      viewBox: '0 0 12 12'  },
  { id: 'settings',       label: 'Налаштування',              path: iconPaths.manufacturingTab, viewBox: '0 0 16 16'  },
];

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

  useEffect(() => {
    const loadProducts = async () => {
      if (products && products.length > 0) {
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

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setIsLoading(true);

      try {
        if (user?.name) {
          if (isMounted) { setUserName(user.name); }
          return;
        }

        const cached = getCachedProfile();
        if (cached?.name) {
          if (isMounted) { setUserName(cached.name); }
          return;
        }

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

      } catch {
        if (isMounted) { setUserName(null); }
      } finally {
        if (isMounted) { setIsLoading(false); }
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
      if (!raw) { return null; }

      const profile = JSON.parse(raw);
      if (!profile.name || profile.name === 'Користувач') { return null; }

      return profile;
    } catch {
      localStorage.removeItem('userProfile');
      return null;
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('userProfile');
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'history':
        return <PurchaseHistoryContent onBack={() => setActiveSection('main')} products={localProducts} />;
      case 'saved':
        return (
          <SavedScenariosContent
            onBack={() => setActiveSection('main')}
            addToCart={addToCart}
            products={localProducts}
            onBookmarkedProductsChange={onBookmarkedProductsChange}
          />
        );
      case 'orders':
        return <PersonalOrdersContent />;
      case 'questionnaires':
        return <QuestionnairesContent />;
      case 'settings':
        return <SettingsContent onShowFAQ={() => setShowFAQ(true)} />;
      default:
        return <DashboardRightSide cards={USER_RIGHT_CARDS} onSectionChange={setActiveSection} />;
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
          <DashboardHeader
            onBackClick={handleBackClick}
            activeSection={activeSection}
            userName={userName ?? 'Користувач'}
            onSectionChange={setActiveSection}
          />
          <DashboardCanvas
            tabs={<SidebarTabs tabs={USER_TABS} activeSection={activeSection} onSectionChange={setActiveSection} />}
            onLogout={handleLogout}
          >
            {renderContent()}
          </DashboardCanvas>
        </div>
      </div>
    </div>
  );
}
