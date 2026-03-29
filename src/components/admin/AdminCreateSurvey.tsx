import { useState } from 'react';
import { iconPaths } from '../ui/icons/iconPaths';

interface AdminCreateSurveyProps {
  onBack: () => void;
}

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };

export function AdminCreateSurvey({ onBack }: AdminCreateSurveyProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    // TODO: Add survey creation logic
    onBack();
  };

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] p-[24px] flex flex-col justify-between h-full"
      data-name="AdminCreateSurvey"
    >
      {/* Poll Fields */}
      <div className="flex flex-col gap-[20px] items-start">
        {/* Question Field */}
        <div className="bg-[#f2f2f2] flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative rounded-[12px] w-full">
          <div
            aria-hidden="true"
            className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]"
          />
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ваше запитання"
            className="flex-1 bg-transparent border-none outline-none text-[16px] text-[#4d4d4d] min-w-0"
            style={fontRegular}
          />
          <svg className="shrink-0" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d={iconPaths.editAdmin} fill="#B3B3B3" />
          </svg>
        </div>

        {/* Option Fields */}
        {options.map((option, index) => (
          <div
            key={index}
            className="bg-[#f2f2f2] flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative rounded-[12px] w-full"
          >
            <div
              aria-hidden="true"
              className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Варіант відповіді ${index + 1}`}
              className="flex-1 bg-transparent border-none outline-none text-[16px] text-[#4d4d4d] min-w-0"
              style={fontRegular}
            />
            <svg className="shrink-0" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d={iconPaths.editAdmin} fill="#B3B3B3" />
            </svg>
          </div>
        ))}

        {/* Add Option Button */}
        <button
          onClick={addOption}
          className="bg-[#f2f2f2] flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative rounded-[12px] w-full cursor-pointer border-none text-left"
        >
          <div
            aria-hidden="true"
            className="absolute border border-[#b3b3b3] border-dashed inset-0 pointer-events-none rounded-[12px]"
          />
          <span className="flex-1 text-[16px] text-[#4d4d4d]" style={fontRegular}>
            Додати варіант відповіді
          </span>
          <svg className="shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M6 8H0V6H6V0H8V6H14V8H8V14H6V8Z" fill="#B3B3B3" />
          </svg>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-[16px] items-center justify-end">
        <button
          onClick={onBack}
          className="h-[44px] px-[24px] py-[12px] rounded-[12px] border-none bg-transparent cursor-pointer text-[16px] text-[#e53935]"
          style={fontRegular}
        >
          Скасувати
        </button>
        <button
          onClick={handleCreate}
          className="bg-[#4caf50] h-[44px] px-[24px] py-[12px] rounded-[12px] border-none cursor-pointer text-[16px] text-white hover:opacity-90 transition-opacity"
          style={fontBold}
        >
          Створити опитування
        </button>
      </div>
    </div>
  );
}
