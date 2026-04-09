import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Services and context
import { apiService } from '../services/api';
import { useAuthContext } from '../context/AuthContext';

// Common components
import { DashboardHeader } from '../components/layout/dashboard/DashboardHeader';
import { SettingsContent } from '../components/layout/dashboard/SettingsContent';

// Layout and UI components
import { DashboardCanvas } from '../components/layout/dashboard/DashboardCanvas';
import { SidebarTabs } from '../components/layout/SidebarTabs';
import { iconPaths } from '../components/ui/icons/iconPaths';

// Layout & shared components
import { DashboardRightSide } from '../components/layout/dashboard/DashboardRightSide';
import { AdminMaterialsContent } from '../components/admin/AdminMaterialsContent';
import { AdminManageMaterial } from '../components/admin/AdminManageMaterial';
import { AdminOrdersContent } from '../components/admin/AdminOrdersContent';
import { AdminOrderDetail } from '../components/admin/AdminOrderDetail';
import { AdminAnalyticsContent } from '../components/admin/AdminAnalyticsContent';
import { AdminPollsContent } from '../components/admin/AdminPollsContent';
import { AdminCreateSurvey } from '../components/admin/AdminCreateSurvey';
import { AdminFacebookPost } from '../components/admin/AdminFacebookPost';

// Types
import { TabItem, DashboardCard } from '../types/ui';


const ADMIN_RIGHT_CARDS: DashboardCard[] = [
  { id: 'materials', label: 'Всі матеріали',               path: iconPaths.homeStorageCard,       viewBox: '0 0 60 60',           iconSize: 80, padding: 'px-[24px] py-[16px]' },
  { id: 'orders',    label: 'Персональні замовлення',      path: iconPaths.contractEditAdminCard, viewBox: '0 0 53.3333 53.3333', iconSize: 64, padding: 'px-[24px] py-[16px]' },
  { id: 'analytics', label: 'Аналітика',                   path: iconPaths.financeModeCard,       viewBox: '0 0 63.3333 63.5',    iconSize: 80, padding: 'px-[24px] py-[16px]' },
  { id: 'polls',     label: 'Опитування для користувачів', path: iconPaths.barChartAdminCard,     viewBox: '0 0 42.6667 42.6667', iconSize: 64, padding: 'px-[24px] py-[16px]' },
];

const ADMIN_TABS: TabItem[] = [
  { id: 'main',      label: 'Головна',                    path: iconPaths.homeTab,          viewBox: '0 0 13.3333 15'    },
  { id: 'materials', label: 'Всі матеріали',              path: iconPaths.homeStorageTab,   viewBox: '0 0 13.5 13.5'     },
  { id: 'orders',    label: 'Персональні замовлення',     path: iconPaths.contractEditTab,  viewBox: '0 0 15 15'         },
  { id: 'analytics', label: 'Аналітика',                  path: iconPaths.financeModeTab,   viewBox: '0 0 14.25 14.2875' },
  { id: 'polls',     label: 'Опитування',                 path: iconPaths.barChartAdminTab, viewBox: '0 0 12 12'        },
  { id: 'settings',  label: 'Налаштування',               path: iconPaths.settingsTab,      viewBox: '0 0 15.7125 15.75' },
];

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState<string>('main');
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [fbProductId, setFbProductId] = useState<number | null>(null);

  const { signOut, user } = useAuthContext();
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  const handleShowFAQ = () => {
    navigate('/faqs');
  };

  const handleSectionChange = (section: string) => {
    setEditingId(null);
    setSelectedOrderId(null);
    setActiveSection(section);
  };

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
          } catch {
            localStorage.removeItem('userProfile');
          }
        }

        const profile = await apiService.getProfile();

        if (profile?.name) {
          setUserName(profile.name);
          localStorage.setItem('userProfile', JSON.stringify({
            name: profile.name,
            email: profile.email,
            imageUrl: profile.avatar_url,
          }));
        }
      } catch {
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

  const renderContent = () => {
    switch (activeSection) {
      case 'materials':
        return (
          <AdminMaterialsContent
            onSectionChange={setActiveSection}
            onEditMaterial={(id) => {
              setEditingId(id);
              setActiveSection('materials-edit');
            }}
          />
        );
      case 'materials-add':
        return (
          <AdminManageMaterial
            onSectionChange={setActiveSection}
            onFbPost={(pid) => { setFbProductId(pid); setActiveSection('facebook-post'); }}
          />
        );
      case 'materials-edit':
        return <AdminManageMaterial mode="edit" productId={editingId} onSectionChange={setActiveSection} />;
      case 'orders':
        return (
          <AdminOrdersContent
            onSectionChange={setActiveSection}
            onViewOrder={(id) => {
              setSelectedOrderId(id);
              setActiveSection('orders-detail');
            }}
          />
        );
      case 'orders-detail':
        return <AdminOrderDetail onSectionChange={setActiveSection} orderId={selectedOrderId} />;
      case 'analytics':
        return <AdminAnalyticsContent onSectionChange={setActiveSection} />;
      case 'polls':
        return <AdminPollsContent onSectionChange={setActiveSection} />;
      case 'polls-create':
        return <AdminCreateSurvey onBack={() => setActiveSection('polls')} />;
      case 'facebook-post':
        return <AdminFacebookPost productId={fbProductId} onSectionChange={setActiveSection} />;
      case 'settings':
        return <SettingsContent onShowFAQ={handleShowFAQ} />;
      default:
        return <DashboardRightSide cards={ADMIN_RIGHT_CARDS} onSectionChange={handleSectionChange} />;
    }
  };

  if (isLoading) {
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
          <DashboardHeader
            onBackClick={handleBackClick}
            activeSection={activeSection}
            userName={userName}
            onSectionChange={setActiveSection}
          />
          <DashboardCanvas
            tabs={<SidebarTabs tabs={ADMIN_TABS} activeSection={activeSection} onSectionChange={handleSectionChange} />}
            onLogout={handleLogout}
          >
            {renderContent()}
          </DashboardCanvas>
        </div>
      </div>
    </div>
  );
}
