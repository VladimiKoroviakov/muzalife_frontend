import svgPaths from "../ui/icons/svgIconPaths";

export function Logout() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="logout">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="logout">
          <mask height="18" id="mask0_50_356" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="18" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="18" id="Bounding box" width="18" />
          </mask>
          <g mask="url(#mask0_50_356)">
            <path d={svgPaths.p3c737080} fill="var(--fill-0, #4D4D4D)" id="logout_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}