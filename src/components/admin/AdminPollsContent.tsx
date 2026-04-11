import { useState } from 'react';
import { useAdminPolls } from '@/hooks/useAdminPolls';
import { PollResult } from '@/types';
import { iconPaths } from '../ui/icons/iconPaths';
import { Voters } from '@/components/common/Polls';

interface AdminPollsContentProps {
  onSectionChange: (section: string) => void;
}

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };
function PollCard({
  poll,
  onClose,
  onDeleteRequest,
}: {
  poll: PollResult;
  onClose: (id: number) => void;
  onDeleteRequest: (id: number) => void;
}) {
  const maxVoteCount = Math.max(...(poll.options ?? []).map((o) => o.vote_count), 1);

  return (
    <div className="bg-white rounded-[16px] px-[24px] pt-[28px] pb-[20px] flex flex-col gap-[28px] relative">
      {/* Delete (×) button */}
      <button
        onClick={() => onDeleteRequest(poll.poll_id)}
        className="absolute top-[16px] right-[16px] w-[20px] h-[20px] rounded-full border border-solid border-[#4d4d4d] flex items-center justify-center cursor-pointer hover:border-[#999] transition-colors"
        style={fontRegular}
        aria-label="Видалити опитування"
      >
        <svg className="block" fill="none" viewBox="0 0 28 28" width={12} height={12}>
          <path d={iconPaths.close} fill="#4d4d4d" />
        </svg>
      </button>

      {/* Question */}
      <h3 className="text-[24px] text-black m-0 pr-[32px]" style={fontBold}>
        {poll.poll_question}
      </h3>

      {/* Options with progress bars */}
      <div className="flex flex-col gap-[24px]">
        {(poll.options ?? []).map((option) => {
          const percentage = Math.round(parseFloat(option.percentage ?? '0'));
          const isWinning = option.vote_count === maxVoteCount && option.vote_count > 0;

          return (
            <div key={option.vote_id} className="flex flex-col gap-[8px]">
              <div className="flex items-center justify-between">
                <span
                  className="text-[18px] text-[#0d0d0d]"
                  style={isWinning ? fontBold : fontRegular}
                >
                  {option.vote_text}
                </span>
                <span
                  className="text-[18px] text-[#0d0d0d]"
                  style={isWinning ? fontBold : fontRegular}
                >
                  {percentage}%
                </span>
              </div>
              {/* Progress bar — inline styles used to guarantee rendering */}
              <div style={{ width: '100%', height: 8, backgroundColor: '#d9d9d9', borderRadius: 1000, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: '#5e89e8', borderRadius: 1000 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <Voters voters={poll.recent_voters ?? []} />
          <span className="text-[16px] text-[#4d4d4d]" style={fontRegular}>
            Всього голосів: {poll.total_votes}
          </span>
        </div>
        {poll.is_active && (
          <button
            onClick={() => onClose(poll.poll_id)}
            className="bg-[#E53935] text-white rounded-[12px] h-[44px] px-[24px] border-none cursor-pointer text-[16px] hover:opacity-90 transition-opacity"
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
  const { polls, loading, error, closePoll, deletePoll } = useAdminPolls();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleConfirmDelete = async () => {
    if (deleteId === null) { return; }
    await deletePoll(deleteId);
    setDeleteId(null);
  };

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] p-[24px] flex flex-col gap-[16px] h-full"
      data-name="AdminPollsContent"
    >
      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-[24px]">
        {loading && (
          <p className="text-[16px] text-[#4d4d4d]" style={fontRegular}>
            Завантаження...
          </p>
        )}
        {error && (
          <p className="text-[16px] text-[#e53935]" style={fontRegular}>
            {error}
          </p>
        )}
        {!loading &&
          !error &&
          polls.map((poll) => (
            <PollCard
              key={poll.poll_id}
              poll={poll}
              onClose={closePoll}
              onDeleteRequest={setDeleteId}
            />
          ))}
      </div>

      {/* Create poll button */}
      <div className="flex justify-end">
        <button
          onClick={() => onSectionChange('polls-create')}
          className="bg-[#4CAF50] text-white rounded-[12px] h-[44px] px-[24px] border-none cursor-pointer text-[16px] hover:opacity-90 transition-opacity"
          style={fontBold}
        >
          Створити опитування
        </button>
      </div>

      {/* Delete confirmation modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[24px] p-[32px] flex flex-col gap-[24px] max-w-[764px] mx-[24px]">
            <h5 className="text-[40px] text-[#0d0d0d] text-center m-0" style={fontRegular}>
              Ви впевнені, що хочете видалити це опитування?
            </h5>
            <p className="text-[20px] text-[#4d4d4d] text-center m-0" style={fontRegular}>
              Якщо Ви натиснете &ldquo;Підтвердити&rdquo;, це опитування та всі голоси будуть повністю видалені і цю дію неможливо буде відмінити
            </p>
            <div className="flex gap-[16px] justify-center">
              <button
                onClick={() => setDeleteId(null)}
                className="h-[44px] px-[24px] rounded-[12px] border border-solid border-[#4d4d4d] bg-white cursor-pointer text-[16px] text-[#0d0d0d] hover:bg-[#f5f5f5] transition-colors"
                style={fontRegular}
              >
                Повернутись
              </button>
              <button
                onClick={handleConfirmDelete}
                className="h-[44px] px-[24px] rounded-[12px] border-none bg-[#E53935] text-white cursor-pointer text-[16px] hover:opacity-90 transition-opacity"
                style={fontBold}
              >
                Підтвердити видалення
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
