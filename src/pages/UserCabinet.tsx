import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

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
import {
  PurchaseHistoryContent,
  SavedScenariosContent,
  PersonalOrdersContent,
  CreatePersonalOrder,
  PersonalOrderDetails,
  PollsContent,
} from '../components/cabinet';
import { SettingsContent } from '../components/layout/dashboard/SettingsContent';

// Types
import { TabItem, DashboardCard } from '../types/ui';

const USER_SECTION_PARENT: Record<string, string> = {
  'history':        'main',
  'saved':          'main',
  'orders':         'main',
  'orders-create':  'orders',
  'orders-detail':  'orders',
  'questionnaires': 'main',
  'settings':       'main',
};

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
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const { signOut, user } = useAuthContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeSection = searchParams.get('tab') ?? 'main';
  const selectedOrderId = searchParams.get('orderId') ? Number(searchParams.get('orderId')) : null;

  const handleBackClick = () => {
    const parent = USER_SECTION_PARENT[activeSection];
    if (parent) {
      handleSectionChange(parent);
    } else if (onBackClick) {
      onBackClick();
    } else {
      window.location.href = '/';
    }
  };

  const handleSectionChange = (section: string) => {
    setSearchParams({ tab: section }, { replace: true });
  };

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
        return <PurchaseHistoryContent onBack={() => handleSectionChange('main')} />;
      case 'saved':
        return (
          <SavedScenariosContent
            onBack={() => handleSectionChange('main')}
            addToCart={addToCart}
            products={localProducts}
            onBookmarkedProductsChange={onBookmarkedProductsChange}
          />
        );
      case 'orders':
        return (
          <PersonalOrdersContent
            onCreateOrder={() => handleSectionChange('orders-create')}
            onViewOrder={(id) => setSearchParams({ tab: 'orders-detail', orderId: String(id) }, { replace: true })}
            refreshKey={ordersRefreshKey}
          />
        );
      case 'orders-create':
        return (
          <CreatePersonalOrder
            onBack={() => handleSectionChange('orders')}
            onCreated={() => { setOrdersRefreshKey((k) => k + 1); handleSectionChange('orders'); }}
          />
        );
      case 'orders-detail':
        if (selectedOrderId === null) {
          handleSectionChange('orders');
          return null;
        }
        return (
          <PersonalOrderDetails
            orderId={selectedOrderId}
            onBack={() => handleSectionChange('orders')}
            onOrderUpdated={() => handleSectionChange('orders')}
          />
        );
      case 'questionnaires':
        return <PollsContent />;
      case 'settings':
        return <SettingsContent onShowFAQ={() => navigate('/faqs')} />;
      default:
        return <DashboardRightSide cards={USER_RIGHT_CARDS} onSectionChange={handleSectionChange} />;
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
    <div className="bg-[#e6e6e6] relative size-full" data-name="User Cabinet">
      <div className="flex flex-col items-center max-w-inherit min-w-inherit size-full">
        <div className="box-border content-stretch flex flex-col gap-[48px] items-center max-w-inherit min-w-inherit px-[48px] py-[24px] relative size-full">
          <DashboardHeader
            onBackClick={handleBackClick}
            activeSection={activeSection}
            userName={userName ?? 'Користувач'}
            onSectionChange={handleSectionChange}
          />
          <DashboardCanvas
            tabs={<SidebarTabs tabs={USER_TABS} activeSection={activeSection} onSectionChange={handleSectionChange} />}
            onLogout={handleLogout}
          >
            {renderContent()}
          </DashboardCanvas>
        </div>
      </div>
    </div>
  );
}
