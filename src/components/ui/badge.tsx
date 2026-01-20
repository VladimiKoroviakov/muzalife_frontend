export default function Badge({ text, color }: { text: string; color?: string }) {
  // Default color mapping
  const getDefaultColor = (type: string) => {
    switch (type) {
      case "Квест": return "#9747ff";
      case "Поезія": return "#FF920D";
      case "Інше": return "#448620";
      case "Безкоштовний матеріал": return "#E53935";
      default: return "#5e89e8";
    }
  };

  const badgeColor = color || getDefaultColor(text);

  return (
    <div 
      className="box-border content-stretch flex gap-[10px] items-center justify-center px-[12px] py-[8px] relative rounded-[8px] shrink-0 border"
      style={{ borderColor: badgeColor }}
      data-name="Badge"
    >
      <div 
        className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[14px] text-nowrap" 
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400", color: badgeColor }}
      >
        <p className="leading-[normal] whitespace-pre">{text}</p>
      </div>
    </div>
  );
}