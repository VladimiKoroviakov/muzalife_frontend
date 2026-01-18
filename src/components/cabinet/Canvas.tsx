import { Tabs } from "./Tabs";
import { Tab } from "./Tab";
import { RightSide } from "./RightSide";
import { PurchaseHistoryContent } from "./PurchaseHistoryContent";
import { SavedScenariosContent } from "./SavedScenariosContent";
import { PersonalOrdersContent } from "./PersonalOrdersContent";
import { QuestionnairesContent } from "./QuestionnairesContent";
import { SettingsContent } from "./SettingsContent";

interface CanvasProps {
  onLogout?: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  addToCart?: (productId: number) => void;
  onShowFAQ: () => void;
  products?: any[];
  onBookmarkedProductsChange?: (products: number[]) => void;
}

export function Canvas({ 
  onLogout, 
  activeSection, 
  onSectionChange, 
  addToCart, 
  onShowFAQ, 
  products, 
  onBookmarkedProductsChange 
}: CanvasProps) {
  const renderContent = () => {
    switch (activeSection) {
      case 'history':
        return <PurchaseHistoryContent
          onBack={() => onSectionChange('main')} 
          products={products}
         />;
      case 'saved':
        return (
          <SavedScenariosContent 
            onBack={() => onSectionChange('main')} 
            addToCart={addToCart} 
            products={products} 
            onBookmarkedProductsChange={onBookmarkedProductsChange} 
          />
        );
      case 'orders':
        return <PersonalOrdersContent />;
      case 'questionnaires':
        return <QuestionnairesContent />;
      case 'settings':
        return <SettingsContent onShowFAQ={onShowFAQ} />;
      default:
        return <RightSide activeSection={activeSection} onSectionChange={onSectionChange} />;
    }
  };

  return (
    <div className="basis-0 content-stretch flex gap-[24px] grow items-start max-w-[1280px] min-h-px min-w-px relative rounded-[16px] shrink-0 w-full" data-name="Canvas">
      <div className="bg-[#f2f2f2] box-border content-stretch flex flex-col h-full items-start justify-between p-[12px] relative rounded-[16px] shrink-0" data-name="Left Side User">
        <Tabs activeSection={activeSection} onSectionChange={onSectionChange} />
        <Tab onLogout={onLogout} />
      </div>
      {renderContent()}
    </div>
  );
}