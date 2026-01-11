import svgPaths from "./svgIconPaths";

export function IconBag() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="icon bag">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="icon bag">
          <mask height="20" id="mask0_1_1732" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
          </mask>
          <g mask="url(#mask0_1_1732)">
            <path d={svgPaths.p2fd02b00} fill="var(--fill-0, #0D0D0D)" id="local_mall" />
          </g>
        </g>
      </svg>
    </div>
  );
}