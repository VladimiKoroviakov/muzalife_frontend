import svgPaths from "./icons/svgIconPaths";

export function Star() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="star">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="star">
          <mask height="24" id="mask0_1_1712" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_1_1712)">
            <path d={svgPaths.p37caf400} fill="var(--fill-0, #E9CF0C)" id="star_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}