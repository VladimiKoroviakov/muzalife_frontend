import svgPaths from "./svgIconPaths";
import { HelpProps } from "../../../types";

export function Help({ onClick }: HelpProps) {
  return (
    <div onClick={onClick} className="relative shrink-0 size-[28px] cursor-pointer" data-name="help">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="help">
          <mask height="28" id="mask0_1_1744" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="28" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="28" id="Bounding box" width="28" />
          </mask>
          <g mask="url(#mask0_1_1744)">
            <path d={svgPaths.p18efcd80} fill="var(--fill-0, #4D4D4D)" id="help_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}