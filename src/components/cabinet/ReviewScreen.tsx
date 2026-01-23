import { useState } from "react";
import  svgPaths from "../ui/icons/svgIconPaths";
import { toast } from "sonner";

function Top({ materialName }: { materialName: string }) {
  return (
    <div className="content-stretch flex gap-[16px] h-[52px] items-center justify-center relative shrink-0 w-full" data-name="top">
      <div className="basis-0 flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] grow h-[24px] justify-end leading-[0] min-h-px min-w-px relative shrink-0 text-[#0d0d0d] text-[32px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
        <p className="leading-[24px]">{materialName}</p>
      </div>
    </div>
  );
}

function Row({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) {
  return (
    <div className="content-stretch flex gap-[20px] items-start relative shrink-0 w-full" data-name="row">
      <div className="basis-0 bg-[#f2f2f2] grow h-[52px] min-h-px min-w-px relative rounded-[12px] shrink-0 cursor-pointer" data-name="Select Form field">
        <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
        <div className="flex flex-row items-center size-full">
          <select 
            value={rating} 
            onChange={(e) => onRatingChange(parseInt(e.target.value))}
            className="box-border content-stretch flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative w-full bg-transparent border-none outline-none cursor-pointer font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] text-[#4d4d4d] text-[16px] appearance-none pr-[40px]"
            style={{ 
              fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10L12 15L17 10' stroke='%23B3B3B3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
              backgroundSize: '24px 24px'
            }}
          >
            <option value={0}>Рейтинг (1-5)</option>
            <option value={1}>1 - Дуже погано</option>
            <option value={2}>2 - Погано</option>
            <option value={3}>3 - Задовільно</option>
            <option value={4}>4 - Добре</option>
            <option value={5}>5 - Відмінно</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function Form({ reviewText, onReviewTextChange }: { reviewText: string; onReviewTextChange: (text: string) => void }) {
  return (
    <div className="basis-0 bg-[#f2f2f2] content-stretch flex flex-col gap-[20px] grow items-start min-h-px min-w-px overflow-clip relative shrink-0 w-full" data-name="Form">
      <div className="basis-0 bg-[#f2f2f2] grow min-h-px min-w-px relative rounded-[12px] shrink-0 w-full" data-name="Form field">
        <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
        <div className="size-full">
          <textarea
            value={reviewText}
            onChange={(e) => onReviewTextChange(e.target.value)}
            placeholder="Введіть Ваш Відгук ..."
            className="box-border content-stretch flex gap-[8px] items-start px-[16px] py-[20px] relative size-full bg-transparent border-none outline-none resize-none font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] text-[#4d4d4d] text-[16px]"
            style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}
          />
        </div>
      </div>
    </div>
  );
}

function Row1({ onCancel, onSubmit, isSubmitting }: { onCancel: () => void; onSubmit: () => void; isSubmitting: boolean }) {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-end relative shrink-0 w-full" data-name="row">
      <div onClick={isSubmitting ? undefined : onCancel} className={`box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/50'}`} data-name="Button">
        <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#e53935] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
          <p className="leading-[normal] whitespace-pre">Скасувати</p>
        </div>
      </div>
      <div onClick={onSubmit} className={`bg-[#5e89e8] box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 cursor-pointer hover:opacity-90 transition-opacity ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`} data-name="Button">
        {isSubmitting ? (
          <>
            <div className="relative shrink-0 size-[20px] animate-spin" data-name="icon loading">
              <svg className="block size-full" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[16px] text-nowrap text-white" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
              <p className="leading-[normal] whitespace-pre">Надсилаємо...</p>
            </div>
          </>
        ) : (
          <>
            <div className="relative shrink-0 size-[20px]" data-name="icon order">
              <div className="absolute inset-[8.33%_4.17%_8.33%_12.5%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px_-2px] mask-size-[24px_24px]" data-name="contract_edit">
                <div className="absolute inset-0" style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}>
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
                    <path d={svgPaths.p7a22000} fill="var(--fill-0, white)" id="contract_edit" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[16px] text-nowrap text-white" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
              <p className="leading-[normal] whitespace-pre">Надіслати відгук</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ReviewScreen({ 
  materialName, 
  onClose, 
  onSubmit 
}: { 
  materialName: string; 
  onClose: () => void; 
  onSubmit: (rating: number, reviewText: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate rating
    if (rating === 0) {
      toast.error('Будь ласка, оберіть рейтинг', {
        description: 'Рейтинг є обов\'язковим полем'
      });
      return;
    }

    // Validate review text
    if (!reviewText.trim()) {
      toast.error('Будь ласка, напишіть відгук', {
        description: 'Текст відгуку є обов\'язковим полем'
      });
      return;
    }

    // Check minimum text length
    if (reviewText.trim().length < 10) {
      toast.error('Відгук занадто короткий', {
        description: 'Будь ласка, напишіть щонайменше 10 символів'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, reviewText);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Помилка при відправці відгуку', {
        description: 'Спробуйте ще раз пізніше'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f2f2f2] relative rounded-[16px] size-full" data-name="Right Side">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-start p-[24px] relative size-full">
          <Top materialName={materialName} />
          <Row rating={rating} onRatingChange={setRating} />
          <Form reviewText={reviewText} onReviewTextChange={setReviewText} />
          <Row1 onCancel={onClose} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </div>
  );
}