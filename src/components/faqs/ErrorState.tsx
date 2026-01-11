import { ErrorStateProps } from "../../types"; 

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="text-red-500 text-[18px] mb-4">
        Сталася помилка
      </div>
      <div className="text-[#666] text-[14px] max-w-md">
        {error}
      </div>
    </div>
  );
}