import svgPaths from "./svgIconPaths";

export function FilterAlt() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="filter_alt">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="filter_alt">
          <mask height="20" id="mask0_1_1728" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="19" id="Bounding box" stroke="var(--stroke-0, black)" width="19" x="0.5" y="0.5" />
          </mask>
          <g mask="url(#mask0_1_1728)">
            <path d={svgPaths.p27ee9700} fill="var(--fill-0, #4D4D4D)" id="filter_alt_2" stroke="var(--stroke-0, #4D4D4D)" />
          </g>
        </g>
      </svg>
    </div>
  );
}