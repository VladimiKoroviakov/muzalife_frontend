import { useState, useEffect } from "react";
import svgPaths from "../ui/icons/svgIconPaths";
import { 
  VoterData,
  Poll,
  ApiPoll,
  OptionProps,
  OptionsProps,
  VotersProps,
  VotesProps,
  RowProps,
  VotedCardProps,
  PollCardProps
} from "../../types"

function CheckCircle() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="check_circle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="check_circle">
          <mask height="40" id="mask0_103_258" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="40" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="40" id="Bounding box" width="40" />
          </mask>
          <g mask="url(#mask0_103_258)">
            <path d={svgPaths.p103bbb00} fill="var(--fill-0, #4CAF50)" id="check_circle_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function RadioButtonUnchecked() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="radio_button_unchecked">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="radio_button_unchecked">
          <mask height="24" id="mask0_103_273" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_103_273)">
            <path d={svgPaths.p1f41680} fill="var(--fill-0, #0D0D0D)" id="radio_button_unchecked_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function RadioButtonChecked() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="radio_button_checked">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="radio_button_checked">
          <mask height="24" id="mask0_103_267" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_103_267)">
            <path d={svgPaths.p2bbbc070} fill="var(--fill-0, #5E89E8)" id="radio_button_checked_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Option({ label, isSelected, onClick }: OptionProps) {
  return (
    <div 
      className="content-center flex flex-wrap gap-[4px] items-center justify-center relative shrink-0 w-full cursor-pointer hover:opacity-80 transition-opacity" 
      data-name="Option"
      onClick={onClick}
    >
      {isSelected ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
      <div className={`basis-0 flex flex-col font-['Atkinson_Hyperlegible:${isSelected ? 'Bold' : 'Regular'}','Noto_Sans:${isSelected ? 'Bold' : 'Regular'}',sans-serif] grow justify-end leading-[0] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#0d0d0d] text-[18px] text-nowrap`} style={{ fontVariationSettings: `'CTGR' 0, 'wdth' 100, 'wght' ${isSelected ? 700 : 400}` }}>
        <p className="[white-space-collapse:collapse] leading-[20px] overflow-ellipsis overflow-hidden">{label}</p>
      </div>
    </div>
  );
}

function Options({ options, selectedOption, onSelectOption }: OptionsProps) {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-name="Options">
      {options.map((option, index) => (
        <Option 
          key={index}
          label={option}
          isSelected={selectedOption === index}
          onClick={() => onSelectOption(index)}
        />
      ))}
    </div>
  );
}

function Voters({ voters }: VotersProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const displayVoters = voters.slice(0, 3);
  
  while (displayVoters.length < 3) {
    displayVoters.push({ name: '', imageUrl: null });
  }

  return (
    <div className="h-[44px] relative shrink-0 w-[76px]" data-name="Voters">
      <div className="flex items-center relative">
        {displayVoters.map((voter, index) => {
          const leftPosition = index * 16; // Overlapping effect
          
          if (!voter.name) {
            // Empty placeholder circle
            return (
              <div 
                key={index}
                className="absolute top-0 w-[44px] h-[44px] rounded-full bg-[#E6E6E6] border-2 border-white"
                style={{ left: `${leftPosition}px` }}
              />
            );
          }
          
          if (voter.imageUrl) {
            // Show user image
            return (
              <div 
                key={index}
                className="absolute top-0 w-[44px] h-[44px] rounded-full border-2 border-white overflow-hidden"
                style={{ left: `${leftPosition}px` }}
              >
                <img 
                  src={voter.imageUrl} 
                  alt={voter.name}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          } else {
            // Show initials
            return (
              <div 
                key={index}
                className="absolute top-0 w-[44px] h-[44px] rounded-full bg-[#5e89e8] border-2 border-white flex items-center justify-center text-white text-sm font-bold"
                style={{ left: `${leftPosition}px` }}
              >
                {getInitials(voter.name)}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

function Votes({ voteCount, voters }: VotesProps) {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0" data-name="Votes">
      <Voters voters={voters} />
      <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] relative shrink-0 text-[#4d4d4d] text-[16px] w-[141px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[24px]">Всього голосів: {voteCount}</p>
      </div>
    </div>
  );
}

function Row({ voteCount, voters, onVote, hasSelection }: RowProps) {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="row">
      <Votes voteCount={voteCount} voters={voters} />
      <div 
        className={`bg-[#5e89e8] box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 ${hasSelection ? 'cursor-pointer hover:opacity-90' : 'opacity-50 cursor-not-allowed'} transition-opacity`}
        data-name="Button"
        onClick={hasSelection ? onVote : undefined}
      >
        <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] justify-end leading-[0] relative shrink-0 text-[16px] text-nowrap text-white" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
          <p className="leading-[normal] whitespace-pre">Проголосувати</p>
        </div>
      </div>
    </div>
  );
}

function VotedCard({ message = "Дякуюємо, Ваш голос враховано!" }: VotedCardProps) {
  return (
    <div className="bg-white h-[269px] relative rounded-[16px] shrink-0 w-full" data-name="Question poll">
      <div className="flex flex-col items-center justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] h-[269px] items-center justify-center pb-[20px] pt-[28px] px-[24px] relative w-full">
          <CheckCircle />
          <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] justify-end leading-[0] min-w-full relative shrink-0 text-[24px] text-black text-center w-[min-content]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
            <p className="leading-[normal]">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PollCard({ question, options, pollIndex, hasVoted, selectedOption, voteCount, voters, onSelectOption, onVote }: PollCardProps) {
  if (hasVoted) {
    return <VotedCard />;
  }

  return (
    <div className="bg-white relative rounded-[16px] shrink-0 w-full" data-name="Question poll">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] items-start pb-[20px] pt-[28px] px-[24px] relative w-full">
          <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] justify-end leading-[0] relative shrink-0 text-[24px] text-black w-full" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
            <p className="leading-[normal]">{question}</p>
          </div>
          <Options 
            options={options}
            selectedOption={selectedOption}
            onSelectOption={(optionIndex) => onSelectOption(pollIndex, optionIndex)}
          />
          <Row 
            voteCount={voteCount}
            voters={voters}
            onVote={() => onVote(pollIndex)}
            hasSelection={selectedOption !== null}
          />
        </div>
      </div>
    </div>
  );
}


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function Scroll() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setError(null);
      await fetchPolls();
    } catch (err) {
      setError("Не вдалося завантажити опитування");
      console.error('Error loading polls:', err);
    }
  };

  const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
  };

  const fetchPolls = async () => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}/polls`, {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.polls) {
        const transformedPolls: Poll[] = result.polls
          .filter((apiPoll: ApiPoll) => !apiPoll.user_has_voted)
          .map((apiPoll: ApiPoll) => {
            const options = apiPoll.options?.map(opt => opt.vote_text) || [];
            
            const voters: VoterData[] = [];
            if (apiPoll.total_votes > 0) {
              for (let i = 0; i < Math.min(3, apiPoll.total_votes); i++) {
                voters.push({
                  name: `Голосувач ${i + 1}`,
                  imageUrl: null
                });
              }
            }

            return {
              id: apiPoll.poll_id,
              question: apiPoll.poll_question,
              options: options,
              selectedOption: null,
              hasVoted: apiPoll.user_has_voted,
              voteCount: apiPoll.total_votes || 0,
              voters: voters
            };
          });
        setPolls(transformedPolls);
      } else {
        throw new Error(result.error || 'Failed to fetch polls');
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (pollId: number, optionIndex: number) => {
    setPolls(prevPolls => prevPolls.map(poll => 
      poll.id === pollId 
        ? { ...poll, selectedOption: optionIndex }
        : poll
    ));
  };

  const handleVote = async (pollId: number) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll || poll.selectedOption === null) return;

    try {
      setError(null);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('Будь ласка, увійдіть в систему, щоб проголосувати');
      }

      // Create headers with consistent typing
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const pollDetailsResponse = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
        headers,
        credentials: 'include'
      });

      if (!pollDetailsResponse.ok) {
        throw new Error('Не вдалося отримати деталі опитування');
      }

      const pollDetails = await pollDetailsResponse.json();
      
      if (!pollDetails.success) {
        throw new Error(pollDetails.error || 'Не вдалося отримати деталі опитування');
      }

      // Find the vote_id for the selected option
      const selectedVote = pollDetails.poll.options?.[poll.selectedOption];
      
      if (!selectedVote) {
        throw new Error('Невірно обраний варіант');
      }
      
      // Submit the vote
      const voteResponse = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ 
          vote_id: selectedVote.vote_id 
        }),
      });

      if (!voteResponse.ok) {
        if (voteResponse.status === 401) {
          throw new Error('Будь ласка, увійдіть в систему, щоб проголосувати');
        }
        
        const errorData = await voteResponse.json().catch(() => ({ error: 'Невідома помилка' }));
        throw new Error(errorData.error || 'Не вдалося надіслати голос');
      }

      const voteResult = await voteResponse.json();
      
      if (!voteResult.success) {
        throw new Error(voteResult.error || 'Не вдалося надіслати голос');
      }

      // Update the poll to show "thank you" message
      const updatedPolls = polls.map(p => 
        p.id === pollId
          ? { ...p, hasVoted: true, voteCount: p.voteCount + 1 }
          : p
      );
      setPolls(updatedPolls);

      // Remove the poll card after 2 seconds
      setTimeout(() => {
        setPolls(prevPolls => prevPolls.filter(p => p.id !== pollId));
      }, 2000);

    } catch (error) {
      console.error('Error submitting vote:', error);
      setError(error instanceof Error ? error.message : "Не вдалося проголосувати");
      
      // Reset selection on error
      setPolls(prevPolls => prevPolls.map(poll => 
        poll.id === pollId 
          ? { ...poll, selectedOption: null }
          : poll
      ));
    }
  };

  const retryLoadPolls = () => {
    setLoading(true);
    loadPolls();
  };

  if (loading) {
    return (
      <div className="basis-0 content-stretch flex flex-col gap-[20px] grow h-full items-start min-h-px min-w-px overflow-x-clip overflow-y-auto relative rounded-tl-[16px] rounded-tr-[16px] shrink-0" data-name="Scroll">
        <div className="bg-white relative rounded-[16px] shrink-0 w-full h-[300px] flex items-center justify-center">
          <p className="text-[#4d4d4d]">Завантаження опитувань...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="basis-0 content-stretch flex flex-col gap-[20px] grow h-full items-start min-h-px min-w-px overflow-x-clip overflow-y-auto relative rounded-tl-[16px] rounded-tr-[16px] shrink-0" data-name="Scroll">
        <div className="bg-white relative rounded-[16px] shrink-0 w-full h-[200px] flex flex-col items-center justify-center gap-4">
          <p className="text-[#d32f2f] text-center">{error}</p>
          <button 
            onClick={retryLoadPolls}
            className="bg-[#5e89e8] text-white px-4 py-2 rounded-[12px] hover:opacity-90 transition-opacity"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="basis-0 content-stretch flex flex-col gap-[20px] grow h-full items-start min-h-px min-w-px overflow-x-clip overflow-y-auto relative rounded-tl-[16px] rounded-tr-[16px] shrink-0" data-name="Scroll">
      {polls.length === 0 ? (
        <div className="bg-white relative rounded-[16px] shrink-0 w-full h-[200px] flex items-center justify-center">
          <p className="text-[#4d4d4d]">Немає доступних опитувань</p>
        </div>
      ) : (
        polls.map((poll) => (
          <PollCard
            key={poll.id}
            question={poll.question}
            options={poll.options}
            pollIndex={poll.id}
            hasVoted={poll.hasVoted}
            selectedOption={poll.selectedOption}
            voteCount={poll.voteCount}
            voters={poll.voters}
            onSelectOption={handleSelectOption}
            onVote={handleVote}
          />
        ))
      )}
    </div>
  );
}

// Export for backward compatibility
export const clearPollsCache = () => {};

export default function Polls() {
  return (
    <div className="bg-[#f2f2f2] relative rounded-[16px] size-full h-full" data-name="Polls">
        <div className="box-border content-stretch flex gap-[12px] h-full items-start px-[12px] relative size-full px-[20px] py-[16px]">
          <Scroll />
        </div>
    </div>
  );
}
