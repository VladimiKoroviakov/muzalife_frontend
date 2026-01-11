import { PurchaseHistory } from "./PurchaseHistory";
import { SavedScenarios } from "./SavedScenarios";
import { PersonalOrders } from "./PersonalOrders";
import { Questionaires } from "./Questionaires";

interface RightSideProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function RightSide({ activeSection, onSectionChange }: RightSideProps) {
  return (
    <div className="basis-0 content-start grid grid-cols-2 auto-rows-fr gap-[24px] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
      <PurchaseHistory onClick={() => onSectionChange('history')} />
      <SavedScenarios onClick={() => onSectionChange('saved')} />
      <PersonalOrders onClick={() => onSectionChange('orders')} />
      <Questionaires onClick={() => onSectionChange('questionnaires')} />
    </div>
  );
}