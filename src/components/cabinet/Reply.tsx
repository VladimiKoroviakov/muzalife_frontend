import svgPaths from "../ui/icons/svgIconPaths";

interface ReplyProps {
  onClick?: () => void;
}

export function Reply({ onClick }: ReplyProps) {
  return (
    <div onClick={onClick} className="relative shrink-0 size-[28px] cursor-pointer" data-name="reply">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="reply">
          <mask height="28" id="mask0_41_181" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="28" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="28" id="Bounding box" width="28" />
          </mask>
          <g mask="url(#mask0_41_181)">
            <path d={svgPaths.p8905cb1} fill="var(--fill-0, #4D4D4D)" id="reply_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}