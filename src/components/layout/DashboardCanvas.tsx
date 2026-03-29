import { ReactNode } from 'react';
import { Tab } from '../cabinet/Tab';

interface CanvasLayoutProps {
  tabs: ReactNode;
  children: ReactNode;
  onLogout?: () => void;
}

export function DashboardCanvas({ tabs, children, onLogout }: CanvasLayoutProps) {
  return (
    <div className="basis-0 content-stretch flex gap-[24px] grow items-start max-w-[1280px] min-h-px min-w-px relative rounded-[16px] shrink-0 w-full" data-name="Canvas">
      <div className="bg-[#f2f2f2] box-border content-stretch flex flex-col h-full items-start justify-between p-[12px] relative rounded-[16px] shrink-0">
        {tabs}
        <Tab onLogout={onLogout} />
      </div>
      {children}
    </div>
  );
}
