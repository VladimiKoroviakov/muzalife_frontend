import { useState } from 'react';

interface PollOption {
  label: string;
  percentage: number;
  isWinning?: boolean;
}

interface PollData {
  id: number;
  question: string;
  options: PollOption[];
  totalVotes: number;
  isActive: boolean;
}

interface AdminPollsContentProps {
  onSectionChange: (section: string) => void;
}

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };

const MOCK_POLLS: PollData[] = [
  {
    id: 1,
    question: 'Який формат матеріалів вам найбільше подобається?',
    options: [
      { label: 'Сценарії свят', percentage: 52, isWinning: true },
      { label: 'Квести та ігри', percentage: 31 },
      { label: 'Поезія та вірші', percentage: 17 },
    ],
    totalVotes: 234,
    isActive: true,
  },
  {
    id: 2,
    question: 'Як часто ви використовуєте матеріали з сайту?',
    options: [
      { label: 'Щотижня', percentage: 15 },
      { label: 'Раз на місяць', percentage: 58, isWinning: true },
      { label: 'Рідше ніж раз на місяць', percentage: 27 },
    ],
    totalVotes: 189,
    isActive: true,
  },
];

function PollCard({
  poll,
  onClose,
}: {
  poll: PollData;
  onClose: (id: number) => void;
}) {
  return (
    <div className="bg-white rounded-[16px] px-[24px] pt-[28px] pb-[20px] flex flex-col gap-[28px]">
      {/* Question */}
      <h3
        className="text-[24px] text-black m-0"
        style={fontBold}
      >
        {poll.question}
      </h3>

      {/* Options with progress bars */}
      <div className="flex flex-col gap-[16px]">
        {poll.options.map((option, optIndex) => (
          <div key={optIndex} className="flex flex-col gap-[6px]">
            <div className="flex items-center justify-between">
              <span
                className="text-[18px] text-[#0d0d0d]"
                style={option.isWinning ? fontBold : fontRegular}
              >
                {option.label}
              </span>
              <span
                className="text-[18px] text-[#0d0d0d]"
                style={option.isWinning ? fontBold : fontRegular}
              >
                {option.percentage}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-[8px] bg-[#d9d9d9] rounded-[1000px] relative overflow-hidden">
              <div
                className="h-full bg-[#5e89e8] rounded-[1000px] absolute left-0 top-0"
                style={{ width: `${option.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          {/* Voter avatars - 3 overlapping circles */}
          <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
            <circle cx="14" cy="14" r="13" fill="#e6e6e6" stroke="#fff" strokeWidth="2" />
            <circle cx="30" cy="14" r="13" fill="#e6e6e6" stroke="#fff" strokeWidth="2" />
            <circle cx="46" cy="14" r="13" fill="#e6e6e6" stroke="#fff" strokeWidth="2" />
          </svg>
          <span
            className="text-[16px] text-[#4d4d4d]"
            style={fontRegular}
          >
            Всього голосів: {poll.totalVotes}
          </span>
        </div>
        {poll.isActive && (
          <button
            onClick={() => onClose(poll.id)}
            className="bg-[#e53935] text-white rounded-[12px] h-[44px] px-[24px] border-none cursor-pointer text-[16px] hover:opacity-90 transition-opacity"
            style={fontRegular}
          >
            Закрити опитування
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminPollsContent({ onSectionChange }: AdminPollsContentProps) {
  const [polls, setPolls] = useState<PollData[]>(MOCK_POLLS);

  const handleClosePoll = (id: number) => {
    setPolls((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: false } : p))
    );
  };

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] p-[24px] flex flex-col gap-[16px] h-full"
      data-name="AdminPollsContent"
    >
      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-[16px]">
        {polls.map((poll) => (
          <PollCard key={poll.id} poll={poll} onClose={handleClosePoll} />
        ))}
      </div>

      {/* Create poll button */}
      <div className="flex justify-end">
        <button
          onClick={() => onSectionChange('polls-create')}
          className="bg-[#4caf50] text-white rounded-[12px] h-[44px] px-[24px] border-none cursor-pointer text-[16px] hover:opacity-90 transition-opacity"
          style={fontBold}
        >
          Створити опитування
        </button>
      </div>
    </div>
  );
}
