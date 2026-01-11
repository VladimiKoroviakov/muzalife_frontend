import { PlusIcon } from "./icons/PlusIcon";
import { CloseIcon } from "./icons/CloseIcon";
import { QuestionProps } from "../../types";

export function Question({ question, answer, isOpen, onClick }: QuestionProps) {
  return (
    <div className={`${isOpen ? 'bg-white sticky top-0 z-10' : 'bg-[#f2f2f2] relative'} rounded-[16px] shrink-0 w-full cursor-pointer transition-colors duration-200`} data-name="Question">
      <div className={isOpen ? "flex flex-col justify-center size-full" : "size-full"}>
        <div className={`box-border content-stretch flex ${isOpen ? 'flex-col' : 'flex-row'} gap-[12px] items-start ${isOpen ? 'justify-center' : 'justify-start'} px-[24px] ${isOpen ? 'py-[20px]' : 'py-[16px]'} relative w-full`}>
          <div onClick={onClick} className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
            <div className={`basis-0 flex flex-col font-['Atkinson_Hyperlegible:${isOpen ? 'Bold' : 'Regular'}','Noto_Sans:${isOpen ? 'Bold' : 'Regular'}',sans-serif] grow justify-end leading-[0] min-h-px min-w-px relative shrink-0 ${isOpen ? 'text-[#0d0d0d] text-[18px]' : 'text-[#4d4d4d] text-[16px]'}`} style={{ fontVariationSettings: `'CTGR' 0, 'wdth' 100, 'wght' ${isOpen ? '700' : '400'}` }}>
              <p className="leading-[24px]">{question}</p>
            </div>
            {isOpen ? <CloseIcon /> : <PlusIcon />}
          </div>
          {isOpen && (
            <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#4d4d4d] text-[16px] w-full" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
              <p className="leading-[24px]">{answer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}