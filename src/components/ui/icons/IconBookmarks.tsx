import svgPaths from "./svgIconPaths";
import { IconBookmarksProps } from "../../../types";

export function IconBookmarks({ isBookmarked }: IconBookmarksProps) {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon bookmarks">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon bookmarks">
          <mask height="24" id="mask0_1_1736" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_1_1736)">
            <path d={svgPaths.p265d1e80} fill={isBookmarked ? "#5E89E8" : "#4D4D4D"} id="bookmarks" />
          </g>
        </g>
      </svg>
    </div>
  );
}