import { iconPaths } from '../ui/icons/iconPaths';

interface RightSideProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const cards = [
  { id: 'history',        label: 'Історія замовлень',           path: iconPaths.workHistoryCard,  viewBox: '0 0 70 70', padding: 'px-[24px] py-[16px]' },
  { id: 'saved',          label: 'Збережені матеріали',          path: iconPaths.bookmarksCard,  viewBox: '0 0 54 67', padding: 'px-[24px] py-[16px]' },
  { id: 'orders',         label: 'Персональні замовлення',       path: iconPaths.contractEditCard, viewBox: '0 0 54 54', padding: 'px-[24px] py-[16px]' },
  { id: 'questionnaires', label: 'Опитування для користувачів', path: iconPaths.barChartCard, viewBox: '0 0 43 43', padding: 'p-[10px]' },
];

export function RightSide({ activeSection: _activeSection, onSectionChange }: RightSideProps) {
  return (
    <div className="basis-0 content-start grid grid-cols-2 auto-rows-fr gap-[24px] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => onSectionChange(card.id)}
          className={`group bg-[#f2f2f2] hover:bg-white box-border content-stretch flex flex-col gap-[12px] items-center justify-center ${card.padding} relative rounded-[16px] w-full cursor-pointer hover:shadow-lg transition-all`}
          data-name={card.label}
        >
          <div className="relative shrink-0 size-[80px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={card.viewBox}>
              <path d={card.path} fill="#4D4D4D" className="group-hover:fill-[#0D0D0D] transition-all" />
            </svg>
          </div>
          <div
            className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] justify-end leading-[0] min-w-full relative shrink-0 text-[#4d4d4d] text-[48px] text-center w-[min-content]"
            style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}
          >
            <p className="leading-[normal] text-[40px] group-hover:text-[#0D0D0D] transition-all">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
