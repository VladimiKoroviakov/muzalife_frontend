import { iconPaths } from '../ui/icons/iconPaths';

interface AdminRightSideProps {
  onSectionChange: (section: string) => void;
}

const cards = [
  {
    id: 'materials',
    label: 'Всі матеріали',
    path: iconPaths.homeStorageCard,
    viewBox: '0 0 60 60',
    iconSize: 80,
  },
  {
    id: 'orders',
    label: 'Персональні замовлення',
    path: iconPaths.contractEditAdminCard,
    viewBox: '0 0 53.3333 53.3333',
    iconSize: 64,
  },
  {
    id: 'analytics',
    label: 'Аналітика',
    path: iconPaths.financeModeCard,
    viewBox: '0 0 63.3333 63.5',
    iconSize: 80,
  },
  {
    id: 'polls',
    label: 'Опитування для користувачів',
    path: iconPaths.barChartAdminCard,
    viewBox: '0 0 42.6667 42.6667',
    iconSize: 64,
  },
];

export function AdminRightSide({ onSectionChange }: AdminRightSideProps) {
  return (
    <div
      className="basis-0 grow min-h-px min-w-px relative rounded-[16px] grid grid-cols-2 grid-rows-2 gap-[24px] h-full"
      data-name="Right Side"
    >
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => onSectionChange(card.id)}
          className="group bg-[#f2f2f2] hover:bg-white box-border flex flex-col gap-[12px] items-center justify-center px-[24px] py-[16px] rounded-[16px] cursor-pointer transition-all"
          data-name={card.label}
        >
          <div
            className="relative shrink-0"
            style={{ width: card.iconSize, height: card.iconSize }}
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
          <div
            className="text-center text-[#4d4d4d] group-hover:text-[#0d0d0d] transition-all"
            style={{
              fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700",
            }}
          >
            <p className="leading-[normal] text-[40px] m-0">
              {card.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
