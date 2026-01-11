import svgPaths from "../ui/icons/svgIconPaths";
import { CloseButtonProps } from "../../types";

function CloseIcon() {
    return (
        <div className="relative shrink-0 size-[28px]" data-name="close">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
                <g id="close">
                    <mask height="28" id="mask0_1_5716" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="28" x="0" y="0">
                        <rect fill="var(--fill-0, #D9D9D9)" height="28" id="Bounding box" width="28" />
                    </mask>
                    <g mask="url(#mask0_1_5716)">
                        <path d={svgPaths.p2e879500} fill="var(--fill-0, #4D4D4D)" id="close_2" />
                    </g>
                </g>
            </svg>
        </div>
    );
}

export function CloseButton({ onClick }: CloseButtonProps) {
    return (
        <div onClick={onClick} className="absolute box-border content-stretch flex gap-[20px] items-center justify-center px-[20px] py-[12px] right-[-0.5px] rounded-[16px] top-0 cursor-pointer hover:opacity-70 transition-opacity" data-name="Close">
            <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[16px]"/>
            <CloseIcon />
        </div>
    );
}