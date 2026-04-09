import { Logo } from '@/components/common/Logo';
import { BackButton } from '../../ui/icons/BackButton';

interface HeaderProps {
  onBackClick?: () => void;
  activeSection: string;
  userName?: string;
  onSectionChange?: (section: string) => void;
}

export function DashboardHeader({ onBackClick, activeSection, userName, onSectionChange: _onSectionChange }: HeaderProps) {
  const getTitleForSection = (section: string): string => {
    const titles: Record<string, string> = {
      // User cabinet sections
      'main': userName ? `Вітаємо ${userName}!` : 'Вітаємо!',
      'history': 'Ваша Історія замовлень',
      'saved': 'Збережені матеріали',
      'orders': 'Персональні замовлення',
      'questionnaires': 'Опитування для користувачів',
      'settings': 'Налаштування профілю',
      // Admin sections
      'materials': 'Всі Матеріали',
      'materials-add': 'Додати Матеріал',
      'materials-edit': 'Редагувати Матеріал',
      'orders-detail': 'Деталі Замовлення',
      'analytics': 'Аналітика',
      'polls': 'Опитування для клієнтів',
      'polls-create': 'Створити опитування',
      'facebook-post': 'Публікація Facebook поста',
    };
    return titles[section] || 'Адміністратор';
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    }
  };
  const displayText = activeSection === 'main' && userName ? `Вітаємо, ${userName}!` : getTitleForSection(activeSection);

  return (
    <div className="content-stretch flex gap-[24px] items-start max-w-[1280px] relative shrink-0 w-full" data-name="Header">
        <Logo />
        <div className="basis-0 content-stretch flex grow h-[52px] items-end justify-between min-h-px min-w-px relative shrink-0" data-name="Search & Menu">
            <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] h-full justify-end leading-[0] relative shrink-0 text-[#4d4d4d] text-[32px] flex-1" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
                <p className="leading-[24px] mt-[20px] mr-[0px] mb-[0px] ml-[45px]">{displayText}</p>
            </div>
            <div className="box-border content-stretch flex gap-[20px] items-center justify-center px-[20px] py-[12px] relative rounded-[16px] shrink-0 hover:opacity-70 transition-opacity" data-name="Close">
                <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[16px]" />
                <BackButton onClick={handleBackClick} />
            </div>
        </div>
    </div>
  );
}
