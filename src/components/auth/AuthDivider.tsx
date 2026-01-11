import React from 'react';

function DividerLine() {
  return (
    <div className="basis-0 grow h-0 min-h-px min-w-px relative shrink-0">
      <div className="absolute bottom-0 left-0 right-0 top-[-1px]" style={{ "--stroke-0": "rgba(77, 77, 77, 1)" } as React.CSSProperties}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 252 1">
          <line id="Line 1" stroke="var(--stroke-0, #4D4D4D)" x2="251.5" y1="0.5" y2="0.5" />
        </svg>
      </div>
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0 w-full" data-name="Divider">
      <DividerLine />
      <div className="flex flex-col  justify-end leading-[0] relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[normal] whitespace-pre">Або</p>
      </div>
      <DividerLine />
    </div>
  );
}