import { ArrowBackIosNew } from "./ArrowBackIosNew";
import { FilterAlt } from "./icons/FilterAlt";

interface FiltersButtonProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export function FiltersButton({ showFilters, setShowFilters }: FiltersButtonProps) {
  if (!showFilters) {
    // Compact version when filters are closed
    return (
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="bg-[#f2f2f2] box-border content-stretch flex gap-[8px] items-center justify-center p-[16px] relative rounded-[16px] shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
        data-name="Filters Button"
      >
        <FilterAlt />
      </button>
    );
  }

  // Expanded version when filters are shown
  return (
    <button
      onClick={() => setShowFilters(!showFilters)}
      className="box-border content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[8px] relative shrink-0 w-[224px] cursor-pointer hover:bg-[#f2f2f2] rounded-[12px] transition-colors text-[20px]"
    >
      <div className="transition-transform flex items-center">
        <ArrowBackIosNew />
      </div>
      <div className="flex items-center">
        <FilterAlt />
      </div>
      <div className="flex items-center relative shrink-0 text-[#4d4d4d] text-[24px] w-[120px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
        <p className="leading-[normal] text-[28px] text-left">Фільтри</p>
      </div>
    </button>
  );
}