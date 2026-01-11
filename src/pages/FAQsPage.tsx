import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFAQs } from "../hooks/useFAQs";
import { Logo } from "../components/ui/Logo";
import CloseButton from "../components/ui/CloseButton";
import { Question } from "../components/faqs/Question";
import { EmptyFAQs } from "../components/faqs/EmptyFAQs";
import { ErrorState } from "../components/faqs/ErrorState";

// Main FaQs Component
export default function FAQs() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const { faqs: faqData, loading, error } = useFAQs();
  const navigate = useNavigate();

  useEffect(() => {
    if (faqData.length > 0 && openQuestion === null && !hasUserInteracted) {
      setOpenQuestion(faqData[0].id);
    }
  }, [faqData, openQuestion, hasUserInteracted]);

  const handleQuestionClick = (index: number) => {
    setHasUserInteracted(true);
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const handleClose = () => {
    navigate(-1);
  };

  const renderQuestions = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="text-[#4d4d4d] text-[16px]">Завантаження...</div>
        </div>
      );
    }

    if (error) {
      return <ErrorState error={error} />;
    }

    if (!faqData || faqData.length === 0) {
      return <EmptyFAQs />;
    }

    return (
      <div className="basis-0 content-stretch flex flex-col gap-[20px] grow h-full items-start min-h-px min-w-px overflow-x-clip overflow-y-auto relative rounded-tl-[16px] rounded-tr-[16px] shrink-0" data-name="Questions">
        {faqData.map((faq) => (
          <Question
            key={faq.id}
            question={faq.question}
            answer={faq.answer}
            isOpen={openQuestion === faq.id}
            onClick={() => handleQuestionClick(faq.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#e6e6e6] relative size-full" data-name="FAQs">
      <div className="flex flex-col items-center max-w-inherit min-w-inherit size-full">
        <div className="box-border content-stretch flex flex-col gap-[48px] items-center max-w-inherit min-w-inherit px-[48px] py-[24px] relative size-full">
          <div className="content-stretch flex gap-[24px] items-start max-w-[1280px] relative shrink-0 w-full" data-name="top bar">
            <Logo />
            <div className="basis-0 content-stretch flex gap-[24px] grow items-center justify-end min-h-px min-w-px relative self-stretch shrink-0" data-name="bar">
              <CloseButton 
                onClick={handleClose} 
              />
            </div>
          </div>

          <div className="content-stretch flex gap-[24px] items-start max-w-[1280px] relative rounded-[12px] shrink-0 w-[1280px]" data-name="Canvas">
            <div className="basis-0 content-stretch flex flex-col gap-[28px] grow h-[728px] items-start justify-center min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Questions">
              <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[48px] text-center w-full" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                <p className="leading-[normal]">Запитання клієнтів</p>
              </div>
              
              <div className="basis-0 content-stretch flex gap-[10px] grow items-start min-h-px min-w-px overflow-clip relative shrink-0 w-full" data-name="Scrollling">
                {renderQuestions()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}