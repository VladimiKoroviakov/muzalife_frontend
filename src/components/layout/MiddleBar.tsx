import { FiltersButton } from "../ui/FiltersButton";
import { TabsContainer } from "../ui/TabsContainer";

interface MiddleBarProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function MiddleBar({ showFilters, setShowFilters, activeTab, setActiveTab }: MiddleBarProps) {
  return (
    <div className={`content-stretch flex gap-[24px] items-center relative shrink-0 ${showFilters ? "justify-center w-full" : "w-[1280px]"}`} data-name="Middle bar">
      <FiltersButton showFilters={showFilters} setShowFilters={setShowFilters} />
      <TabsContainer activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}