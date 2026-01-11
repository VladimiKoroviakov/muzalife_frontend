interface LoginSubmitButtonProps {
  onClick?: () => void;
  isLoading?: boolean;
}

export function LoginSubmitButton({ onClick, isLoading }: LoginSubmitButtonProps) {
  return (
    <button 
      type="submit"
      onClick={onClick}
      disabled={isLoading}
      className="bg-[#5e89e8] h-[54px] relative rounded-[16px] shrink-0 w-full cursor-pointer hover:bg-[#4a75d4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
      data-name="Button"
    >
      <div aria-hidden="true" className="absolute border border-[#5e89e8] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[54px] items-center justify-center px-[24px] py-[16px] relative w-full">
          <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] justify-end leading-[0] relative shrink-0 text-[18px] text-nowrap text-white" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
            <p className="leading-[normal] whitespace-pre">
              {isLoading ? "Вхід..." : "Увійти"}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}