import svgPaths from "./svgIconPaths";

export function Search() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="search">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="search">
          <mask height="24" id="mask0_1_1764" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_1_1764)">
            <path d={svgPaths.pc423380} fill="var(--fill-0, #4D4D4D)" id="search_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}