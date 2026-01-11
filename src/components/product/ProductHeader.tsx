import { Logo } from "../ui/Logo";
import svgIconPaths from "../ui/icons/svgIconPaths";

export function ProductHeader({ onClose }: { onClose?: () => void }) {
  return (
    <div className="content-stretch flex gap-[24px] items-start max-w-[1280px] relative shrink-0 w-full" data-name="Header">
      <Logo />
      <div className="basis-0 content-stretch flex gap-[24px] grow items-center justify-end min-h-px min-w-px relative self-stretch shrink-0" data-name="Search & Menu">
        <div 
          onClick={onClose}
          className="box-border content-stretch flex gap-[20px] items-center justify-center px-[20px] py-[12px] relative rounded-[16px] shrink-0 cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition-colors" 
          data-name="Close"
        >
          <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[16px]" />
          <div className="relative shrink-0 size-[28px]" data-name="back">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
              <g id="reply">
                <mask height="28" id="mask0_1_6337" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="28" x="0" y="0">
                  <rect fill="var(--fill-0, #D9D9D9)" height="28" id="Bounding box" width="28" />
                </mask>
                <g mask="url(#mask0_1_6337)">
                  <path d={svgIconPaths.p8905cb1} fill="var(--fill-0, #4D4D4D)" id="reply_2" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}