import Polls from "../ui/Polls";

export function QuestionnairesContent() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[10px] grow h-full items-start min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
      <div className="h-full w-full">
        <Polls />
      </div>
    </div>
  );
}