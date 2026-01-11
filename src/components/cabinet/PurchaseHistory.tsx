import svgPaths from "../ui/icons/svgIconPaths";

interface PurchaseHistoryProps {
  onClick?: () => void;
}

export function PurchaseHistory({ onClick }: PurchaseHistoryProps) {
  return (
    <div onClick={onClick} className="group bg-[#f2f2f2] hover:bg-white box-border content-stretch flex flex-col gap-[12px] items-center justify-center px-[24px] py-[16px] relative rounded-[16px] w-full cursor-pointer hover:shadow-lg transition-all" data-name="Purchase History">
      <div className="relative shrink-0 size-[80px]" data-name="icon order history">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 70">
          <path d={svgPaths.p808de00} fill="#4D4D4D" className="group-hover:fill-[#0D0D0D] transition-all" id="work_history" />
        </svg>
      </div>
      <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] justify-end leading-[0] min-w-full relative shrink-0 text-[#0d0d0d] text-[48px] text-center w-[min-content]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
        <p className="leading-[normal] text-[40px] text-[rgb(77,77,77)] group-hover:text-[#0D0D0D] transition-all">Історія замовлень</p>
      </div>
    </div>
  );
}