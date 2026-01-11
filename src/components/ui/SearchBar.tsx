import { Search } from "./icons/Search";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  return (
    <div className="basis-0 bg-[#f2f2f2] grow h-[52px] min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Search bar">
      <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[52px] items-center justify-between p-[4px] relative w-full">
          <div className="box-border content-stretch flex gap-[12px] items-center px-[12px] py-0 relative grow">
            <Search />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Я шукаю... наприклад, патріотичний сценарій"
              className="basis-0 flex flex-col grow justify-end leading-[0] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap bg-transparent border-none outline-none"
              style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="flex items-center justify-center w-[44px] h-[44px] rounded-[12px] shrink-0 cursor-pointer hover:bg-[#f2f2f2] transition-colors text-[#4d4d4d]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}