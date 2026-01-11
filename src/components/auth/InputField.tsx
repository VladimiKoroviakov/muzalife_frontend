interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  type: string;
  placeholder: string;
  maxLength?: number;
}

export function InputField({ value, onChange, type, placeholder, maxLength }: InputFieldProps) {
  return (
    <div className="bg-[#f2f2f2] h-[52px] relative rounded-[16px] shrink-0 w-full" data-name={`${type} Field`}>
      <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative w-full">
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            className="basis-0 grow text-[#4d4d4d] text-[16px] bg-transparent border-none outline-none w-full"
            style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
          />
        </div>
      </div>
    </div>
  );
}