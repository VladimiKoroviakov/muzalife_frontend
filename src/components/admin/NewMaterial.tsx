import svgIconPaths from "../ui/icons/svgIconPaths";

function IconUpload() {
  return (
    <div className="relative shrink-0 size-[112px]" data-name="icon upload">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 112 112">
        <g id="icon upload">
          <mask height="112" id="mask0_5_1485" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="112" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="112" id="Bounding box" width="112" />
          </mask>
          <g mask="url(#mask0_5_1485)">
            <path d={svgIconPaths.p342b8b80} fill="var(--fill-0, #1C1B1F)" id="drive_folder_upload" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#0d0d0d] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[normal] whitespace-pre">Оберіть файли</p>
      </div>
    </div>
  );
}

function DragDrop() {
  return (
    <div className="h-[372px] relative rounded-[12px] shrink-0 w-full" data-name="Drag & Drop">
      <div aria-hidden="true" className="absolute border border-[#4d4d4d] border-dashed inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col items-center justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] h-[372px] items-center justify-center px-[48px] py-[40px] relative w-full">
          <IconUpload />
          <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[24px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
            <p className="leading-[24px] whitespace-pre">Перетягніть файли (матеріали для відправки) сюди</p>
          </div>
          <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] min-w-full relative shrink-0 text-[#4d4d4d] text-[16px] text-center w-[min-content]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
            <p className="leading-[24px]">або</p>
          </div>
          <Button />
          <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] min-w-full relative shrink-0 text-[#4d4d4d] text-[16px] text-center w-[min-content]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
            <p className="leading-[24px]">Дозволені типи файлів: .rar .zip .docx .pdf .pptx .png .jpg</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField() {
  return (
    <div className="bg-[#f2f2f2] h-[52px] relative rounded-[12px] shrink-0 w-full" data-name="Form field">
      <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative w-full">
          <div className="basis-0 flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] grow justify-end leading-[0] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
            <p className="[white-space-collapse:collapse] leading-[normal] overflow-ellipsis overflow-hidden">Введіть назву свята...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconArrowDown() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon arrow down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon arrow down">
          <mask height="24" id="mask0_5_1473" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_5_1473)">
            <path d={svgIconPaths.p2b1b0180} fill="var(--fill-0, #4D4D4D)" id="keyboard_arrow_down" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function SelectFormField() {
  return (
    <div className="bg-[#f2f2f2] h-[52px] relative rounded-[12px] shrink-0 w-full" data-name="Select Form field">
      <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative w-full">
          <div className="basis-0 flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] grow justify-end leading-[0] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
            <p className="[white-space-collapse:collapse] leading-[normal] overflow-ellipsis overflow-hidden">Оберіть вікові групи</p>
          </div>
          <IconArrowDown />
        </div>
      </div>
    </div>
  );
}

function IconArrowDown1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon arrow down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon arrow down">
          <mask height="24" id="mask0_5_1473" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_5_1473)">
            <path d={svgIconPaths.p2b1b0180} fill="var(--fill-0, #4D4D4D)" id="keyboard_arrow_down" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function SelectFormField1() {
  return (
    <div className="basis-0 bg-[#f2f2f2] grow h-[52px] min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Select Form field">
      <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative w-full">
          <div className="basis-0 flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] grow justify-end leading-[0] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
            <p className="[white-space-collapse:collapse] leading-[normal] overflow-ellipsis overflow-hidden">Оберіть тип контенту</p>
          </div>
          <IconArrowDown1 />
        </div>
      </div>
    </div>
  );
}

function FormField1() {
  return (
    <div className="basis-0 bg-[#f2f2f2] grow h-[52px] min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Form field">
      <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative w-full">
          <div className="basis-0 flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] grow justify-end leading-[0] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
            <p className="[white-space-collapse:collapse] leading-[normal] overflow-ellipsis overflow-hidden">Введіть ціну...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row() {
  return (
    <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full" data-name="row">
      <SelectFormField1 />
      <FormField1 />
    </div>
  );
}

function Button1({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 cursor-pointer" data-name="Button" onClick={onCancel}>
      <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#e53935] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="[text-underline-position:from-font] decoration-solid leading-[normal] underline whitespace-pre">Скасувати</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#5e89e8] box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[16px] text-nowrap text-white" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[normal] whitespace-pre">Продовжити</p>
      </div>
    </div>
  );
}

function Row1({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-end relative shrink-0 w-full" data-name="row">
      <Button1 onCancel={onCancel} />
      <Button2 />
    </div>
  );
}

export default function RightSide({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="bg-[#f2f2f2] relative rounded-[16px] size-full" data-name="Right Side">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start justify-between p-[20px] relative size-full">
          <DragDrop />
          <FormField />
          <SelectFormField />
          <Row />
          <Row1 onCancel={onCancel} />
        </div>
      </div>
    </div>
  );
}