import svgPaths from "../ui/icons/svgIconPaths";

interface QuestionairesProps {
  onClick?: () => void;
}

export function Questionaires({ onClick }: QuestionairesProps) {
  return (
    <div onClick={onClick} className="group bg-[#f2f2f2] hover:bg-white box-border content-stretch flex flex-col gap-[12px] items-center justify-center p-[10px] relative rounded-[16px] w-full cursor-pointer hover:shadow-lg transition-all" data-name="Questionaires">
      <div className="relative shrink-0 size-[80px]" data-name="icon poll">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 43 43">
          <path d={svgPaths.p3a417800} fill="#4D4D4D" className="group-hover:fill-[#0D0D0D] transition-all" id="bar_chart" />
        </svg>
      </div>
      <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] justify-end leading-[normal] min-w-full relative shrink-0 text-[#4d4d4d] text-[48px] text-center w-[min-content]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
        <p className="mb-0 text-[40px] group-hover:text-[#0D0D0D] transition-all">{`Опитування `}</p>
        <p className="text-[40px] group-hover:text-[#0D0D0D] transition-all">для користувачів</p>
      </div>
    </div>
  );
}