import { Reply } from "./Reply";

interface SearchMenuProps {
  onBackClick?: () => void;
  title: string;
  userName?: string;
  activeSection: string;
}

export function SearchMenu({ onBackClick, title, userName, activeSection }: SearchMenuProps) {
  const displayText = activeSection === 'main' && userName ? `Вітаємо, ${userName}!` : title;
  
  return (
    <div className="basis-0 content-stretch flex grow h-[52px] items-end justify-between min-h-px min-w-px relative shrink-0" data-name="Search & Menu">
      <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] h-full justify-end leading-[0] relative shrink-0 text-[#4d4d4d] text-[32px] flex-1" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
        <p className="leading-[24px] mt-[20px] mr-[0px] mb-[0px] ml-[45px]">{displayText}</p>
      </div>
      <div className="box-border content-stretch flex gap-[20px] items-center justify-center px-[20px] py-[12px] relative rounded-[16px] shrink-0 hover:opacity-70 transition-opacity" data-name="Close">
        <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[16px]" />
        <Reply onClick={onBackClick} />
      </div>
    </div>
  );
}