export interface TabItem {
  id: string;
  label: string;
  path: string;
  viewBox: string;
  iconSize?: 'size-[16px]';
}

interface SidebarTabsProps {
  tabs: TabItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function SidebarTabs({ tabs, activeSection, onSectionChange }: SidebarTabsProps) {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Tabs">
      {tabs.map((tab) => {
        const isActive = activeSection === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => onSectionChange(tab.id)}
            className={`${isActive ? 'bg-white' : ''} box-border flex gap-[8px] items-center px-[12px] py-[16px] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-white transition-colors`}
            data-name="Tab"
          >
            <div className="relative shrink-0 size-[16px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={tab.viewBox}>
                <path d={tab.path} fill={isActive ? 'var(--fill-0, #0D0D0D)' : 'var(--fill-0, #4D4D4D)'} />
              </svg>
            </div>
            <div
              className={`flex flex-col ${
                isActive
                  ? "font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] text-[#0d0d0d]"
                  : "font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] text-[#4d4d4d]"
              } grow justify-center leading-[0] min-h-px min-w-px relative`}
              style={{ fontVariationSettings: isActive ? "'CTGR' 0, 'wdth' 100, 'wght' 700" : "'CTGR' 0, 'wdth' 100, 'wght' 400", fontSize: '16px' }}
            >
              <p className="leading-[20px]">{tab.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
