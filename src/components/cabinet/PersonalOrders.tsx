import svgPaths from "../ui/icons/svgIconPaths";

interface PersonalOrdersProps {
  onClick?: () => void;
}

export function PersonalOrders({ onClick }: PersonalOrdersProps) {
  return (
    <div onClick={onClick} className="group bg-[#f2f2f2] hover:bg-white box-border content-stretch flex flex-col gap-[12px] items-center justify-center px-[24px] py-[16px] relative rounded-[16px] w-full cursor-pointer hover:shadow-lg transition-all" data-name="Personal orders">
      <div className="relative shrink-0 size-[80px]" data-name="icon order">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 54 54">
          <path d={svgPaths.p2ac81600} fill="#4D4D4D" className="group-hover:fill-[#0D0D0D] transition-all" id="contract_edit" />
        </svg>
      </div>
      <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] justify-end leading-[0] min-w-full relative shrink-0 text-[#4d4d4d] text-[48px] text-center w-[min-content]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
        <p className="leading-[normal] text-[40px] group-hover:text-[#0D0D0D] transition-all">Персональні замовлення</p>
      </div>
    </div>
  );
}