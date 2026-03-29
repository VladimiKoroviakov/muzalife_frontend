import { iconPaths } from './iconPaths';

interface BackButtonProps {
  onClick?: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <div onClick={onClick} className="relative shrink-0 size-[28px] cursor-pointer" data-name="back-button">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="back">
          <mask height="28" id="mask0_41_181" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }} width="28" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="28" id="Bounding box" width="28" />
          </mask>
          <g mask="url(#mask0_41_181)">
            <path d={iconPaths.goBack} fill="var(--fill-0, #4D4D4D)" id="back_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}
