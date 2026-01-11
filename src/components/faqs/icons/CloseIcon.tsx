import svgPaths from "../../ui/icons/svgIconPaths";

export function CloseIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="close">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="close">
          <mask height="24" id="mask0_1_5712" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_1_5712)">
            <path d={svgPaths.p2edaeb50} fill="var(--fill-0, #1C1B1F)" id="close_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}