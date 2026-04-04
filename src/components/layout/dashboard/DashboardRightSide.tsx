/**
 * Unified, purely presentational right-side dashboard card grid.
 *
 * All logic (which cards to show, what happens on click) lives entirely
 * in the parent component.  This component just renders whatever `cards`
 * and `onSectionChange` it receives.
 */

import { DashboardCard } from '../../../types/ui';

interface DashboardRightSideProps {
  /** Array of card configurations supplied by the parent. */
  cards: DashboardCard[];
  /** Called with the card's id when the user clicks a card. */
  onSectionChange: (section: string) => void;
  /** Override the outer grid container className. */
  gridClassName?: string;
}

const DEFAULT_GRID_CLASS =
  'basis-0 grow min-h-px min-w-px relative rounded-[16px] grid grid-cols-2 auto-rows-fr gap-[24px] h-full';

const DEFAULT_ICON_SIZE = 80;
const DEFAULT_PADDING = 'px-[24px] py-[16px]';

export function DashboardRightSide({
  cards,
  onSectionChange,
  gridClassName,
}: DashboardRightSideProps) {
  return (
    <div
      className={gridClassName ?? DEFAULT_GRID_CLASS}
      data-name="Right Side"
    >
      {cards.map((card) => {
        const size = card.iconSize ?? DEFAULT_ICON_SIZE;
        const padding = card.padding ?? DEFAULT_PADDING;

        return (
          <div
            key={card.id}
            onClick={() => onSectionChange(card.id)}
            className={`group bg-[#f2f2f2] hover:bg-white box-border flex flex-col gap-[12px] items-center justify-center ${padding} relative rounded-[16px] w-full cursor-pointer hover:shadow-lg transition-all`}
            data-name={card.label}
          >
            {/* Icon */}
            <div
              className="relative shrink-0"
              style={{ width: size, height: size }}
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="xMidYMid meet"
                viewBox={card.viewBox}
              >
                <path
                  d={card.path}
                  fill="#4D4D4D"
                  className="group-hover:fill-[#0D0D0D] transition-all"
                />
              </svg>
            </div>

            {/* Label */}
            <div
              className="text-center text-[#4d4d4d] group-hover:text-[#0d0d0d] transition-all min-w-full"
              style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}
            >
              <p className="leading-[normal] text-[40px] m-0">{card.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
