import svgPaths from "./icons/svgIconPaths";

export function FamilyRestroom() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="family_restroom">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="family_restroom">
          <mask height="16" id="mask0_1_1760" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="16" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="16" id="Bounding box" width="16" />
          </mask>
          <g mask="url(#mask0_1_1760)">
            <path d={svgPaths.p20da0280} fill="var(--fill-0, #4D4D4D)" id="family_restroom_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}