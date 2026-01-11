import { FamilyRestroom } from "../ui/FamilyRestroom";
import { Celebration } from "../ui/Celebration";
import { RadioButtonChecked } from "../ui/RadioButtonChecked";
import { RadioButtonUnchecked } from "../ui/RadioButtonUnchecked";
import { CheckBoxChecked } from "../ui/CheckBoxChecked";
import { CheckBoxOutlineBlank } from "../ui/CheckBoxOutlineBlank";

interface FiltersSidebarProps {
  selectedAgeCategory: string | null;
  setSelectedAgeCategory: (category: string | null) => void;
  selectedEvents: string[];
  toggleEvent: (event: string) => void;
  clearFilters: () => void;
}

export function FiltersSidebar({
  selectedAgeCategory,
  setSelectedAgeCategory,
  selectedEvents,
  toggleEvent,
  clearFilters
}: FiltersSidebarProps) {
  const ageCategories = [
    "Дитячий садок (3-6 років)",
    "Початкова школа (6-10 років)", 
    "Середня школа (10-15 років)",
    "Старша школа (15-18 років)"
  ];

  const events = [
    "Перший дзвоник",
    "8 березня",
    "Різдво",
    "Новий рік",
    "Випускний",
    "День вишиванки",
    "День молоді",
    "День козацтва",
    "День матері",
    "День батька",
    "Хелловін",
    "Масляна",
    "Інші свята та заходи",
  ];

  return (
    <div className="bg-[#f2f2f2] h-full relative rounded-[16px] shrink-0 w-[224px]" data-name="Filters Sidebar">
      <div className="box-border content-stretch flex flex-col gap-[12px] h-full items-center justify-center overflow-clip px-[6px] py-[24px] relative rounded-[inherit] w-[224px]">
        <div className="basis-0 content-stretch flex flex-col gap-[32px] grow h-full items-center min-h-px min-w-px overflow-x-clip overflow-y-auto relative shrink-0">
          {/* Age Category Section */}
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
            <div className="bg-[#f2f2f2] content-stretch flex gap-[4px] items-center justify-center shrink-0 sticky top-0 w-full opacity-100 z-10">
              <FamilyRestroom />
              <div className="basis-0 flex flex-col grow justify-end leading-[0] min-h-px min-w-px relative shrink-0 text-[#4d4d4d] text-[16px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                <p className="leading-[normal]">Вікова категорія</p>
              </div>
            </div>
            <div className="relative shrink-0 w-full">
              <div className="box-border content-stretch flex flex-col gap-[16px] items-start pl-[16px] pr-0 py-0 relative w-full">
                {ageCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedAgeCategory(category)}
                    className="content-stretch flex gap-[4px] items-start relative shrink-0 w-[160px] cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    {selectedAgeCategory === category ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
                    <div className="basis-0 flex flex-col grow justify-end leading-[0] min-h-px min-w-px relative shrink-0 text-[#4d4d4d] text-[14px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                      <p className="leading-[20px]">{category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
            <div className="bg-[#f2f2f2] content-stretch flex gap-[4px] items-center justify-center shrink-0 sticky top-0 opacity-100 z-10">
              <Celebration />
              <div className="flex flex-col justify-end leading-[0] relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                <p className="leading-[normal] whitespace-pre">Назва свята/заходу</p>
              </div>
            </div>
            <div className="relative shrink-0 w-full">
              <div className="box-border content-stretch flex flex-col gap-[16px] items-start pl-[16px] pr-0 py-0 relative w-full">
                {events.map((event) => (
                  <button
                    key={event}
                    onClick={() => toggleEvent(event)}
                    className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    {selectedEvents.includes(event) ? <CheckBoxChecked /> : <CheckBoxOutlineBlank />}
                    <div className="flex flex-col justify-end leading-[0] overflow-ellipsis overflow-hidden relative shrink-0 text-[#4d4d4d] text-[14px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                      <p className="leading-[normal] overflow-ellipsis overflow-hidden whitespace-pre">{event}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={clearFilters}
          className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
        >
          <div className="flex flex-col justify-end leading-[0] relative shrink-0 text-[14px] text-neutral-500 text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
            <p className="[text-underline-position:from-font] decoration-solid leading-[normal] underline whitespace-pre">Очистити фільтри</p>
          </div>
        </button>
      </div>
      <div aria-hidden="true" className="absolute border border-[#e6e6e6] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}