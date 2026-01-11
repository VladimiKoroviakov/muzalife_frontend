interface TabsContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function TabsContainer({ activeTab, setActiveTab }: TabsContainerProps) {
  const tabs = [
    { id: "all", label: "Всі матеріали" },
    { id: "scenarios", label: "Сценарії" },
    { id: "quests", label: "Квести" },
    { id: "poetry", label: "Поезія" },
    { id: "free", label: "Безкоштовні матеріали" },
    { id: "other", label: "Інше" },
  ];

  return (
    <div className="content-stretch flex items-center overflow-clip relative shrink-0 w-[1032px]" data-name="Tabs Container">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className="content-stretch flex flex-col items-center justify-center relative shrink-0 cursor-pointer group transition-colors"
        >
          <div className={`box-border content-stretch flex items-center justify-center pb-[12px] pt-[16px] px-[28px] relative shrink-0 ${tab.id === "all" ? "px-[24px]" : ""}`}>
            <div className={`flex flex-col font-['Atkinson_Hyperlegible:${activeTab === tab.id ? "Bold" : "Regular"}','Noto_Sans:${activeTab === tab.id ? "Bold" : "Regular"}',sans-serif] justify-end leading-[0] relative shrink-0 text-[${activeTab === tab.id ? "#5e89e8" : "#4d4d4d"}] text-[16px] text-nowrap`} style={{ fontVariationSettings: `'CTGR' 0, 'wdth' 100, 'wght' ${activeTab === tab.id ? 700 : 400}`, color: activeTab === tab.id ? "#5e89e8" : "#4d4d4d" }}>
              <p className="leading-[normal] whitespace-pre">{tab.label}</p>
            </div>
          </div>
          <div className={`bg-[#5e89e8] h-[4px] rounded-[4px] shrink-0 w-full transition-opacity ${activeTab === tab.id ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
        </button>
      ))}
    </div>
  );
}