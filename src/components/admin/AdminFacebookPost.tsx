import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import { iconPaths } from '../ui/icons/iconPaths';
import { apiService } from '@/services/api';

export interface AdminFacebookPostProps {
  productId: number | null;
  onSectionChange: (section: string) => void;
}

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };

function truncateFileName(name: string): string {
  if (name.length <= 10) { return name; }
  const lastDot = name.lastIndexOf('.');
  const ext = lastDot >= 0 ? name.slice(lastDot) : '';
  const base = lastDot >= 0 ? name.slice(0, lastDot) : name;
  if (base.length <= 6) { return name; }
  return `${base.slice(0, 4)}...${base.slice(-2)}${ext}`;
}

function FileChip({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <div className="relative flex flex-row items-center gap-[8px] rounded-[8px] px-3 py-2 rounded-[16px] bg-background w-auto max-w-[160px] border border-solid border-[#e6e6e6]">
      <button
        onClick={onRemove}
        aria-label={`Видалити ${name}`}
        className="absolute top-[-8px] right-[-4px] w-[20px] h-[20px] rounded-full border border-solid border-[#4d4d4d] flex items-center justify-center cursor-pointer hover:border-[#999] transition-colors"
      >
        <svg className="block" fill="none" viewBox="0 0 28 28" width={12} height={12}>
          <path d={iconPaths.close} fill="#4d4d4d" />
        </svg>
      </button>
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
        <mask id="mask0_1837_18283" maskUnits="userSpaceOnUse" x="0" y="0" width="28" height="28">
          <rect width="28" height="28" fill="#D9D9D9"/>
        </mask>
        <g>
          <path d="M9.33366 15.1663H18.667V12.833H9.33366V15.1663ZM9.33366 18.6663H18.667V16.333H9.33366V18.6663ZM9.33366 22.1663H15.167V19.833H9.33366V22.1663ZM7.00033 25.6663C6.35866 25.6663 5.80935 25.4379 5.35241 24.9809C4.89546 24.524 4.66699 23.9747 4.66699 23.333V4.66634C4.66699 4.02467 4.89546 3.47537 5.35241 3.01842C5.80935 2.56148 6.35866 2.33301 7.00033 2.33301H16.3337L23.3337 9.33301V23.333C23.3337 23.9747 23.1052 24.524 22.6482 24.9809C22.1913 25.4379 21.642 25.6663 21.0003 25.6663H7.00033ZM15.167 10.4997H21.0003L15.167 4.66634V10.4997Z" fill="#5E89E8"/>
        </g>
      </svg>
      <span className="text-[12px] text-[#0d0d0d]" style={fontRegular}>
        {truncateFileName(name)}
      </span>
    </div>
  );
}

function DashedBorder({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full pointer-events-none overflow-visible h-full"
    >
      <rect
        x="1" y="1"
        width="calc(100% - 2px)" height="calc(100% - 2px)"
        rx="11" ry="11"
        fill="none"
        stroke={active ? '#5e89e8' : '#4d4d4d'}
        strokeWidth="1"
        strokeDasharray="10 8"
      />
    </svg>
  );
}

export function AdminFacebookPost({ productId, onSectionChange }: AdminFacebookPostProps) {
  const [images, setImages] = useState<File[]>([]);
  const [postText, setPostText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setImages((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files: selected } = e.target;
    if (selected) { setImages((prev) => [...prev, ...Array.from(selected)]); }
  };
  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handlePublish = async () => {
    if (productId === null) {
      toast.error('Не вдалося визначити продукт для публікації');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.adminPublishFacebookPost(productId, {
        images: images.length > 0 ? images : undefined,
        text: postText.trim() || undefined,
      });
      toast.success('Пост успішно опубліковано в Facebook');
      onSectionChange('materials');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Помилка при публікації посту');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasImages = images.length > 0;

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] flex flex-col justify-between p-[20px] py-[29px] h-full gap-[24px]"
      data-name="AdminFacebookPost"
    >
      {/* Image drag & drop area */}
      <div
        className="relative rounded-[12px] shrink-0 w-full"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <DashedBorder active={isDragOver} />
        <div className="flex flex-col items-center justify-center w-full px-[48px] py-[40px] gap-[16px]">
          {!hasImages && (
            <div className="relative shrink-0 w-[80px] h-[80px] flex items-center justify-center">
              {/* Upload folder icon */}
              <svg width="94" height="75" viewBox="0 0 94 75" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.33333 74.6667C6.76667 74.6667 4.56944 73.7528 2.74167 71.925C0.913889 70.0972 0 67.9 0 65.3333V9.33333C0 6.76667 0.913889 4.56944 2.74167 2.74167C4.56944 0.913889 6.76667 0 9.33333 0H37.3333L46.6667 9.33333H84C86.5667 9.33333 88.7639 10.2472 90.5917 12.075C92.4195 13.9028 93.3333 16.1 93.3333 18.6667V65.3333C93.3333 67.9 92.4195 70.0972 90.5917 71.925C88.7639 73.7528 86.5667 74.6667 84 74.6667H9.33333ZM42 60.6667H51.3333V41.0667L58.8 48.5333L65.3333 42L46.6667 23.3333L28 42L34.5333 48.5333L42 41.0667V60.6667Z" fill="#1C1B1F" />
              </svg>
            </div>
          )}

          <p className="text-[20px] text-[#0d0d0d] text-center m-0 leading-[28px]" style={fontBold}>
            Перетягніть зображення для Facebook поста
          </p>

          <p className="text-[16px] text-[#4d4d4d] text-center m-0 leading-[24px]" style={fontRegular}>
            або
          </p>

          <button
            onClick={() => imageInputRef.current?.click()}
            className="bg-white box-border flex items-center justify-center gap-[8px] h-[44px] px-[24px] py-[12px] rounded-[12px] border border-solid border-[#0d0d0d] cursor-pointer text-[16px] text-[#0d0d0d] hover:bg-gray-50 transition-colors"
            style={fontRegular}
          >
            {hasImages ? 'Оберіть ще файли' : 'Оберіть файли'}
          </button>
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg"
            className="hidden"
            onChange={handleImageChange}
          />

          <p className="text-[14px] text-[#4d4d4d] text-center m-0 leading-[24px]" style={fontRegular}>
            Дозволені типи файлів: .png .jpg
          </p>

          {hasImages && (
            <div className="flex flex-wrap gap-[8px] justify-start w-full">
              {images.map((img, index) => (
                <FileChip key={`fb-${img.name}-${index}`} name={img.name} onRemove={() => removeImage(index)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post text textarea */}
      <div className="relative rounded-[12px] shrink-0 w-full flex-1 min-h-[160px]">
        <div
          aria-hidden="true"
          className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]"
        />
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Введіть текст Facebook поста..."
          className="w-full h-full bg-transparent border-none outline-none px-[16px] py-[16px] text-[16px] text-[#0d0d0d] placeholder-[#4d4d4d] rounded-[12px] resize-none"
          style={fontRegular}
        />
      </div>

      {/* Hint */}
      <p className="text-[14px] text-[#e53935] m-0 leading-[20px] shrink-0" style={fontRegular}>
        <span className="underline">
          * Якщо бажаєте використати попередньо завантажені зображення чи опис матеріалу - залиште ці поля без змін
        </span>
      </p>

      {/* Action row */}
      <div className="flex gap-[16px] items-center justify-end shrink-0 w-full">
        <button
          onClick={() => onSectionChange('materials')}
          className="h-[44px] px-[24px] py-[12px] rounded-[12px] border-none bg-transparent cursor-pointer text-[16px] text-[#e53935] underline"
          style={fontRegular}
        >
          Скасувати
        </button>
        <button
          onClick={handlePublish}
          disabled={isSubmitting}
          className="bg-[#5e89e8] h-[44px] px-[24px] py-[12px] rounded-[12px] border-none cursor-pointer text-[16px] text-white hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          style={fontRegular}
        >
          {isSubmitting ? 'Публікація...' : 'Опублікувати пост'}
        </button>
      </div>
    </div>
  );
}
