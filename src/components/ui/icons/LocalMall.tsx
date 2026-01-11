import svgPaths from "./svgIconPaths";
import { LocalMallProps } from "../../../types";

export function LocalMall({ count }: LocalMallProps) {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="local_mall">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="local_mall">
          <mask height="28" id="mask0_1_1724" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="28" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="28" id="Bounding box" width="28" />
          </mask>
          <g mask="url(#mask0_1_1724)">
            <path d={svgPaths.pd62e280} fill="var(--fill-0, #4D4D4D)" id="local_mall_2" />
          </g>
        </g>
      </svg>
      {count > 0 && (
        <div className="absolute -top-1 -right-1 bg-[#5e89e8] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
          {count}
        </div>
      )}
    </div>
  );
}