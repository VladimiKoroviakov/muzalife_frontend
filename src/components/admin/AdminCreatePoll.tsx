import { useState } from 'react';
import { apiService } from '@/services/api';
import { iconPaths } from '../ui/icons/iconPaths';

interface AdminCreatePollProps {
  onBack: () => void;
}

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };

export function AdminCreatePoll({ onBack }: AdminCreatePollProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    if (options.length >= 10) { return; }
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    const trimmedQuestion = question.trim();
    const filledOptions = options.map((o) => o.trim()).filter(Boolean);

    if (!trimmedQuestion) {
      setError('Введіть запитання для опитування.');
      return;
    }
    if (filledOptions.length < 2) {
      setError('Додайте щонайменше два варіанти відповіді.');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await apiService.adminCreatePoll({ pollQuestion: trimmedQuestion, options: filledOptions });
      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося створити опитування.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] p-[24px] flex flex-col gap-[16px] h-full"
      data-name="AdminCreateSurvey"
    >
      {/* Question Field — pinned at top */}
      <div className="shrink-0 bg-[#f2f2f2] flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative rounded-[12px] w-full">
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

      {/* Scrollable options list */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-[20px] py-[8px]">
        {options.map((option, index) => (
          <div
            key={index}
            className="shrink-0 bg-[#f2f2f2] flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative rounded-[12px] w-full"
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
            <button
              type="button"
              onClick={() => removeOption(index)}
              disabled={options.length <= 2}
              className="shrink-0 w-[18px] h-[18px] flex items-center justify-center bg-transparent border-none cursor-pointer p-0 text-[#b3b3b3] hover:text-[#e53935] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label={`Видалити варіант ${index + 1}`}
            >
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                <path d={iconPaths.close} fill="currentColor" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add Option Button — hidden when limit reached */}
        {options.length < 10 && (
          <button
            onClick={addOption}
            className="shrink-0 bg-[#f2f2f2] flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative rounded-[12px] w-full cursor-pointer border-none text-left"
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
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-[12px] items-end">
        {error && (
          <p className="text-[14px] text-[#e53935]" style={fontRegular}>
            {error}
          </p>
        )}
        <div className="flex gap-[16px] items-center">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="h-[44px] px-[24px] py-[12px] rounded-[12px] border-none bg-transparent cursor-pointer text-[16px] text-[#e53935] disabled:opacity-50"
            style={fontRegular}
          >
            Скасувати
          </button>
          <button
            onClick={handleCreate}
            disabled={isSubmitting}
            className="bg-[#4CAF50] h-[44px] px-[24px] py-[12px] rounded-[12px] border-none cursor-pointer text-[16px] text-white hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            style={fontBold}
          >
            {isSubmitting ? 'Створення...' : 'Створити опитування'}
          </button>
        </div>
      </div>
    </div>
  );
}
