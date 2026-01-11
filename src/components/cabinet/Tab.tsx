import { Logout } from "./Logout";

interface TabProps {
  onLogout?: () => void;
}

export function Tab({ onLogout }: TabProps) {
  const handleLogout = () => {
    console.log('Logout button clicked, calling parent handler');
    if (onLogout) {
      onLogout();
    } else {
      console.warn('No onLogout handler provided');
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div onClick={handleLogout} className="relative rounded-[16px] shrink-0 w-full cursor-pointer hover:bg-white transition-colors" data-name="Tab">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[8px] items-center justify-center p-[12px] relative w-full">
          <Logout />
          <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#4d4d4d] text-[14px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
            <p className="leading-[normal] whitespace-pre">Вийти</p>
          </div>
        </div>
      </div>
    </div>
  );
}