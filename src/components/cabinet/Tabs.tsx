import svgPaths from "../ui/icons/svgIconPaths";

interface TabsProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Tabs({ activeSection, onSectionChange }: TabsProps) {
  const tabs = [
    { id: 'main', label: 'Головна', icon: 'home' },
    { id: 'history', label: 'Історія замовлень', icon: 'work_history' },
    { id: 'saved', label: 'Збережені', icon: 'bookmarks' },
    { id: 'orders', label: 'Персональні замовлення', icon: 'contract_edit' },
    { id: 'questionnaires', label: 'Опитування', icon: 'bar_chart' },
    { id: 'settings', label: 'Налаштування', icon: 'manufacturing' },
  ];

  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Tabs">
      {tabs.map((tab) => {
        const isActive = activeSection === tab.id;
        const isHome = tab.id === 'main';
        
        return (
          <div
            key={tab.id}
            onClick={() => onSectionChange(tab.id)}
            className={`${isActive ? 'bg-white' : ''} box-border flex gap-[8px] items-center justify-center px-[12px] py-[16px] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-white transition-colors`}
            data-name="Tab"
          >
            <div className={`relative shrink-0 ${isHome ? 'size-[20px]' : 'size-[18px]'}`} data-name={`icon ${tab.icon}`}>
              <div 
                className={`absolute ${
                isHome ? 'inset-[12.5%_16.67%] mask-position-[-4px_-3px]' :
                tab.icon === 'work_history' ? 'inset-[8.33%_4.17%_4.17%_8.33%] mask-position-[-2px]' :
                tab.icon === 'bookmarks' ? 'inset-[8.33%_16.67%] mask-position-[-4px_-2px]' :
                tab.icon === 'contract_edit' ? 'inset-[8.33%_4.17%_8.33%_12.5%] mask-position-[-3px_-2px]' :
                tab.icon === 'bar_chart' ? 'inset-[16.667%] mask-position-[-4px]' :
                'inset-[8.33%_4.38%_4.17%_8.33%] mask-position-[-2px]'
                } mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-size-[24px_24px]`}
                data-name={tab.icon}
              >
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={
                isHome ? "0 0 14 15" :
                tab.icon === 'work_history' ? "0 0 16 16" :
                tab.icon === 'bookmarks' ? "0 0 12 15" :
                tab.icon === 'contract_edit' ? "0 0 15 15" :
                tab.icon === 'bar_chart' ? "0 0 12 12" :
                "0 0 16 16"
                }>
                  <path 
                    d={
                    isHome ? svgPaths.p298cd00 :
                    tab.icon === 'work_history' ? svgPaths.p7e1c800 :
                    tab.icon === 'bookmarks' ? svgPaths.p1376d480 :
                    tab.icon === 'contract_edit' ? svgPaths.p30ee4700 :
                    tab.icon === 'bar_chart' ? svgPaths.p18e8cd30 :
                    svgPaths.p1fd0af80
                    }
                    fill={isActive ? "var(--fill-0, #0D0D0D)" : "var(--fill-0, #4D4D4D)"}
                    id={tab.icon}
                  />
                </svg>
              </div>
            </div>
            <div className={`basis-0 flex flex-col font-['Atkinson_Hyperlegible:${isActive ? 'Bold' : 'Regular'}','Noto_Sans:${isActive ? 'Bold' : 'Regular'}',sans-serif] grow justify-center leading-[0] min-h-px min-w-px relative shrink-0`} style={{ fontVariationSettings: `'CTGR' 0, 'wdth' 100, 'wght' ${isActive ? 700 : 400}`, color: isActive ? '#0d0d0d' : '#4d4d4d', fontSize: '16px' }}>
              <p className="leading-[20px]">{tab.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}