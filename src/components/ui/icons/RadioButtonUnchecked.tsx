import { iconPaths } from './iconPaths';

export function RadioButtonUnchecked() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="radio_button_unchecked">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="radio_button_unchecked">
          <mask height="20" id="mask0_1_1720" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }} width="20" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="20" id="Bounding box" width="20" />
          </mask>
          <g mask="url(#mask0_1_1720)">
            <path d={iconPaths.radioButtonUnchecked} fill="var(--fill-0, #4D4D4D)" id="radio_button_unchecked_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}
