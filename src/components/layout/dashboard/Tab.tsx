import { iconPaths } from '../../ui/icons/iconPaths';

interface TabProps {
    onLogout?: () => void;
}

export function Tab({ onLogout }: TabProps) {
    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            localStorage.clear();
            window.location.href = '/';
        }
    };

    return (
        <div onClick={handleLogout} className="relative rounded-[16px] shrink-0 w-full cursor-pointer hover:bg-white transition-colors" data-name="Tab">
            <div className="flex flex-row items-center justify-center size-full">
                <div className="box-border content-stretch flex gap-[8px] items-center justify-center p-[12px] relative w-full">
                    <div className="relative shrink-0 size-[18px]" data-name="logout">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                            <g id="logout">
                            <mask height="18" id="mask0_50_356" maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }} width="18" x="0" y="0">
                                <rect fill="var(--fill-0, #D9D9D9)" height="18" id="Bounding box" width="18" />
                            </mask>
                            <g mask="url(#mask0_50_356)">
                                <path d={iconPaths.logout} fill="var(--fill-0, #4D4D4D)" id="logout_2" />
                            </g>
                            </g>
                        </svg>
                    </div>
                    <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#4d4d4d] text-[14px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                        <p className="leading-[normal] whitespace-pre">Вийти</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
