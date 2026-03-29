import { Logo } from '../ui/Logo';
import { SearchMenu } from './SearchMenu';

interface HeaderProps {
  onBackClick?: () => void;
  activeSection: string;
  userName?: string;
  onSectionChange?: (section: string) => void;
}

export function Header({ onBackClick, activeSection, userName, onSectionChange: _onSectionChange }: HeaderProps) {
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
    };
    return titles[section] || 'Адміністратор';
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    }
  };

  return (
    <div className="content-stretch flex gap-[24px] items-start max-w-[1280px] relative shrink-0 w-full" data-name="Header">
      <Logo />
      <SearchMenu
        onBackClick={handleBackClick}
        title={getTitleForSection(activeSection)}
        userName={userName}
        activeSection={activeSection}
      />
    </div>
  );
}
