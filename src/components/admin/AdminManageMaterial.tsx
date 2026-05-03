import { useState, useRef, useEffect, useMemo, type DragEvent, type ChangeEvent, type MouseEvent } from 'react';
import { toast } from 'sonner';
import { iconPaths } from '../ui/icons/iconPaths';
import { apiService } from '@/services/api';
import { useProductMetadata } from '@/hooks/useProductMetadata';
import type { ProductFile } from '@/types';

export interface AdminMaterialFormProps {
  onSectionChange: (section: string) => void;
  onFbPost?: (productId: number) => void;
  mode?: 'add' | 'edit';
  productId?: string | null;
}

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };

// ── Sub-components ─────────────────────────────────────────────────────────────

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

interface MultiSelectProps {
  options: { id: number; name: string }[];
  selected: number[];
  onChange: (ids: number[]) => void;
  placeholder: string;
  disabled?: boolean;
}

function MultiSelect({ options, selected, onChange, placeholder, disabled }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState<'up' | 'down'>('down');
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculate available space and set dropdown direction
  useEffect(() => {
    if (!isOpen || !containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // If there's more space below, open downward; otherwise open upward
    // Also ensure minimum space of 200px for the dropdown
    if (spaceBelow > spaceAbove && spaceBelow > 200) {
      setDropdownDirection('down');
    } else if (spaceAbove > 200) {
      setDropdownDirection('up');
    } else {
      // Default to down if both are constrained
      setDropdownDirection('down');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) { return; }
    const handler = (e: globalThis.MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => { document.removeEventListener('mousedown', handler); };
  }, [isOpen]);

  const label = useMemo(() => {
    if (selected.length === 0) { return placeholder; }
    if (selected.length === 1) {
      return options.find((o) => o.id === selected[0])?.name ?? placeholder;
    }
    return `${selected.length} обрано`;
  }, [selected, options, placeholder]);

  const toggle = (id: number, e: MouseEvent) => {
    e.stopPropagation();
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  // Get dropdown positioning classes
  const dropdownPositionClass = dropdownDirection === 'down'
    ? 'top-full mt-1'
    : 'bottom-full mb-1';

  return (
    <div ref={containerRef} className="relative flex-1 h-[52px]">
      <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <button
        ref={buttonRef}
        type="button"
        onClick={() => { if (!disabled) { setIsOpen((v) => !v); } }}
        className={`flex items-center size-full px-[16px] py-[4px] gap-[8px] bg-transparent border-none rounded-[12px] w-full text-left ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`flex-1 text-[16px] truncate ${selected.length === 0 || disabled ? 'text-[#4d4d4d]' : 'text-[#0d0d0d]'}`}
          style={fontRegular}
        >
          {disabled ? 'Завантаження...' : label}
        </span>
        <div className="shrink-0 w-[24px] h-[24px] pointer-events-none">
          <svg className="block size-full" fill="none" viewBox="0 0 12 8">
            <path d={iconPaths.keyboardArrowDown} fill="#4D4D4D" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div
          className={`absolute ${dropdownPositionClass} mt-1 left-0 right-0 z-10 bg-white border border-solid border-[#b3b3b3] rounded-[12px] shadow-md max-h-[280px] overflow-y-auto`}
          style={{
            // Ensure dropdown has a reasonable minimum and maximum size
            minHeight: 'auto',
            maxHeight: '200px',
          }}
        >
          {options.length === 0 ? (
            <div className="px-[16px] py-[10px] text-[#4d4d4d] text-center">
              Немає доступних опцій
            </div>
          ) : (
            options.map((opt) => {
              const checked = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => { toggle(opt.id, e); }}
                  className="flex items-center gap-[10px] w-full px-[16px] py-[10px] bg-transparent border-none text-left cursor-pointer hover:bg-[#f5f5f5] transition-colors"
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      border: checked ? '1px solid #5e89e8' : '1px solid #b3b3b3',
                      backgroundColor: checked ? '#5e89e8' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {checked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[16px] text-[#0d0d0d]" style={fontRegular}>{opt.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

type ExistingImage = { url: string; isMain: boolean; imageId?: number };

export function AdminManageMaterial({ onSectionChange, onFbPost, mode = 'add', productId }: AdminMaterialFormProps) {
  // ── Metadata from backend ─────────────────────────────────────────────────────
  const { types, ageCategories, events: eventOptions, isLoading: isMetadataLoading } = useProductMetadata();

  // ── Step 1 state ─────────────────────────────────────────────────────────────
  const [files, setFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<ProductFile[]>([]);
  const [removedFileIds, setRemovedFileIds] = useState<number[]>([]);
  const [scenarioName, setScenarioName] = useState('');
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [selectedAgeCategoryIds, setSelectedAgeCategoryIds] = useState<number[]>([]);
  const [contentType, setContentType] = useState('');
  const [price, setPrice] = useState('');
  const [isFileDragOver, setIsFileDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Step 2 state ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [removedMainImage, setRemovedMainImage] = useState(false);
  const [removeImageUrls, setRemovedImageUrls] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [isImageDragOver, setIsImageDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Prefill for edit mode ─────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'edit' || !productId || isMetadataLoading) { return; }

    apiService.getProductById(productId).then((product) => {
      setScenarioName(product.title);
      setPrice(String(product.price));
      setContentType(String(types.find((t) => t.name === product.type)?.id ?? ''));
      setSelectedAgeCategoryIds(
        product.ageCategory
          .map((name) => ageCategories.find((a) => a.name === name)?.id)
          .filter((id): id is number => id !== undefined),
      );
      setSelectedEventIds(
        product.events
          .map((name) => eventOptions.find((e) => e.name === name)?.id)
          .filter((id): id is number => id !== undefined),
      );
      setDescription(product.description);

      const imgs: ExistingImage[] = [];
      if (product.image) {
        imgs.push({ url: product.image, isMain: true });
      }
      (product.additionalImages ?? []).forEach((url) => {
        imgs.push({ url, isMain: false });
      });
      setExistingImages(imgs);
    }).catch(() => {
      toast.error('Не вдалося завантажити дані матеріалу');
    });

    apiService.adminGetProductFiles(parseInt(productId, 10)).then((fetched) => {
      setExistingFiles(fetched);
    }).catch(() => {
      toast.error('Не вдалося завантажити файли матеріалу');
    });
  }, [mode, productId, isMetadataLoading, types, ageCategories, eventOptions]);

  // ── Step 1 handlers ───────────────────────────────────────────────────────────
  const handleFileDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsFileDragOver(true); };
  const handleFileDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsFileDragOver(false); };
  const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsFileDragOver(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files: selected } = e.target;
    if (selected) { setFiles((prev) => [...prev, ...Array.from(selected)]); }
  };
  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));
  const removeExistingFile = (fileId: number) => {
    setExistingFiles((prev) => prev.filter((f) => f.fileId !== fileId));
    setRemovedFileIds((prev) => [...prev, fileId]);
  };
  const removeExistingImage = (img: ExistingImage) => {
    setExistingImages((prev) => prev.filter((i) => i.url !== img.url));
    if (img.isMain) {
      setRemovedMainImage(true);
    } else if (img.url) {
      setRemovedImageUrls((prev) => [...prev, img.url as string]);
    }
  };

  const handleContinue = () => {
    if (files.length === 0 && existingFiles.length === 0) { toast.error('Додайте хоча б один файл матеріалу'); return; }
    if (!scenarioName.trim()) { toast.error('Введіть назву матеріалу'); return; }
    if (!contentType) { toast.error('Оберіть тип контенту'); return; }
    if (!price.trim() || isNaN(parseFloat(price))) { toast.error('Введіть коректну ціну'); return; }
    setStep(2);
  };

  // ── Step 2 handlers ───────────────────────────────────────────────────────────
  const handleImageDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsImageDragOver(true); };
  const handleImageDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsImageDragOver(false); };
  const handleImageDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsImageDragOver(false);
    setImages((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files: selected } = e.target;
    if (selected) { setImages((prev) => [...prev, ...Array.from(selected)]); }
  };
  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (mode === 'add' && images.length === 0) { toast.error('Додайте хоча б одне зображення'); return; }
    if (!description.trim()) { toast.error('Введіть опис матеріалу'); return; }

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && productId) {
        await apiService.adminUpdateProduct(
          parseInt(productId, 10),
          {
            title: scenarioName,
            description,
            price: parseFloat(price),
            typeId: parseInt(contentType, 10),
            ageCategoryIds: selectedAgeCategoryIds,
            eventIds: selectedEventIds,
          },
          {
            files,
            removeFileIds: removedFileIds,
            images,
            removeImageUrls,
            removeMainImage: removedMainImage,
          },
        );
        toast.success('Матеріал успішно оновлено');
        onSectionChange('materials');
      } else {
        const created = await apiService.adminAddProduct(
          {
            title: scenarioName,
            description,
            price: parseFloat(price),
            typeId: parseInt(contentType, 10),
            ageCategoryIds: selectedAgeCategoryIds.length > 0 ? selectedAgeCategoryIds : undefined,
            eventIds: selectedEventIds.length > 0 ? selectedEventIds : undefined,
          },
          {
            mainImage: images[0],
            images: images.slice(1),
            files,
          },
        );
        setCreatedProductId(created.id);
        setStep(3);
        return;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Помилка при збереженні матеріалу');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  const hasFiles = files.length > 0 || existingFiles.length > 0;
  const hasImages = images.length > 0 || existingImages.length > 0;
  const isEdit = mode === 'edit';

  if (step === 3) {
    return (
      <div
        className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] flex flex-col items-center justify-center p-[20px] h-full gap-[24px]"
        data-name="AdminMaterialForm-Step3"
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: '#4caf50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M8 18L15 25L28 11" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="text-[16px] text-[#4d4d4d] m-0 text-center" style={fontRegular}>
          Матеріал успішно додано до каталогу
        </p>

        <p className="text-[28px] text-[#0d0d0d] m-0 text-center leading-[36px]" style={fontBold}>
          Бажаєте зробити пост в Facebook?
        </p>

        <div className="flex gap-[16px] items-center">
          <button
            onClick={() => onSectionChange('materials')}
            className="h-[44px] px-[24px] py-[12px] rounded-[12px] border-none bg-transparent cursor-pointer text-[16px] text-[#4d4d4d] underline"
            style={fontRegular}
          >
            Повернутись
          </button>
          <button
            onClick={() => { if (createdProductId !== null) { onFbPost?.(createdProductId); } }}
            className="bg-[#5e89e8] h-[44px] px-[24px] py-[12px] rounded-[12px] border-none cursor-pointer text-[16px] text-white hover:opacity-90 transition-opacity"
            style={fontRegular}
          >
            Зробити пост
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div
        className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] flex flex-col justify-between p-[20px] py-[29px] h-full gap-[24px]"
        data-name="AdminMaterialForm-Step2"
      >
        {/* Image drag & drop area */}
        <div
          className="relative rounded-[12px] shrink-0 w-full"
          onDragOver={handleImageDragOver}
          onDragLeave={handleImageDragLeave}
          onDrop={handleImageDrop}
        >
          <DashedBorder active={isImageDragOver} />
          <div className="flex flex-col items-center justify-center w-full px-[48px] py-[40px] gap-[16px]">
            {!hasImages && (
              <div className="relative shrink-0 w-[80px] h-[80px] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="94" height="75" viewBox="0 0 94 75" fill="none">
                  <path d="M9.33333 74.6667C6.76667 74.6667 4.56944 73.7528 2.74167 71.925C0.913889 70.0972 0 67.9 0 65.3333V9.33333C0 6.76667 0.913889 4.56944 2.74167 2.74167C4.56944 0.913889 6.76667 0 9.33333 0H37.3333L46.6667 9.33333H84C86.5667 9.33333 88.7639 10.2472 90.5917 12.075C92.4195 13.9028 93.3333 16.1 93.3333 18.6667V65.3333C93.3333 67.9 92.4195 70.0972 90.5917 71.925C88.7639 73.7528 86.5667 74.6667 84 74.6667H9.33333ZM42 60.6667H51.3333V41.0667L58.8 48.5333L65.3333 42L46.6667 23.3333L28 42L34.5333 48.5333L42 41.0667V60.6667Z" fill="#1C1B1F" />
                </svg>
              </div>
            )}

            <p className="text-[20px] text-[#0d0d0d] text-center m-0 leading-[28px]" style={fontBold}>
              Перетягніть зображення та уривки сюди
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
                {existingImages.map((img) => (
                  <FileChip
                    key={img.url}
                    name={img.url.split('/').at(-1) ?? img.url}
                    onRemove={() => removeExistingImage(img)}
                  />
                ))}
                {images.map((img, index) => (
                  <FileChip key={`new-${img.name}-${index}`} name={img.name} onRemove={() => removeImage(index)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description textarea */}
        <div className="relative rounded-[12px] shrink-0 w-full flex-1 min-h-[160px]">
          <div
            aria-hidden="true"
            className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введіть опис матеріалу..."
            className="w-full h-full bg-transparent border-none outline-none px-[16px] py-[16px] text-[16px] text-[#0d0d0d] placeholder-[#4d4d4d] rounded-[12px] resize-none"
            style={fontRegular}
          />
        </div>

        {/* Action row */}
        <div className="flex gap-[16px] items-center justify-end shrink-0 w-full">
          <button
            onClick={() => setStep(1)}
            className="h-[44px] px-[24px] py-[12px] rounded-[12px] border-none bg-transparent cursor-pointer text-[16px] text-[#4d4d4d] underline"
            style={fontRegular}
          >
            Повернутись
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#5e89e8] h-[44px] px-[24px] py-[12px] rounded-[12px] border-none cursor-pointer text-[16px] text-white hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            style={fontRegular}
          >
            {isSubmitting
              ? (isEdit ? 'Збереження...' : 'Публікація...')
              : (isEdit ? 'Зберегти зміни' : 'Опублікувати матеріал')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] flex flex-col justify-between p-[20px] py-[29px] h-full"
      data-name="AdminMaterialForm-Step1"
    >
      {/* Drag & Drop area */}
      <div
        className="relative rounded-[12px] shrink-0 w-full"
        onDragOver={handleFileDragOver}
        onDragLeave={handleFileDragLeave}
        onDrop={handleFileDrop}
      >
        <DashedBorder active={isFileDragOver} />
        <div className="flex flex-col items-center justify-center w-full px-[48px] py-[40px] gap-[16px]">
          {!hasFiles && (
            <div className="relative shrink-0 w-[80px] h-[80px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="94" height="75" viewBox="0 0 94 75" fill="none">
                <path d="M9.33333 74.6667C6.76667 74.6667 4.56944 73.7528 2.74167 71.925C0.913889 70.0972 0 67.9 0 65.3333V9.33333C0 6.76667 0.913889 4.56944 2.74167 2.74167C4.56944 0.913889 6.76667 0 9.33333 0H37.3333L46.6667 9.33333H84C86.5667 9.33333 88.7639 10.2472 90.5917 12.075C92.4195 13.9028 93.3333 16.1 93.3333 18.6667V65.3333C93.3333 67.9 92.4195 70.0972 90.5917 71.925C88.7639 73.7528 86.5667 74.6667 84 74.6667H9.33333ZM42 60.6667H51.3333V41.0667L58.8 48.5333L65.3333 42L46.6667 23.3333L28 42L34.5333 48.5333L42 41.0667V60.6667Z" fill="#1C1B1F" />
              </svg>
            </div>
          )}

          <p className="text-[20px] text-[#0d0d0d] text-center m-0 leading-[28px]" style={fontBold}>
            Перетягніть файли (матеріали для відправки) сюди
          </p>

          <p className="text-[16px] text-[#4d4d4d] text-center m-0 leading-[24px]" style={fontRegular}>
            або
          </p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white box-border flex items-center justify-center gap-[8px] h-[44px] px-[24px] py-[12px] rounded-[12px] border border-solid border-[#0d0d0d] cursor-pointer text-[16px] text-[#0d0d0d] hover:bg-gray-50 transition-colors"
            style={fontRegular}
          >
            {hasFiles ? 'Оберіть ще файли' : 'Оберіть файли'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".rar,.zip,.docx,.pdf,.pptx,.png,.jpg"
            className="hidden"
            onChange={handleFileChange}
          />

          <p className="text-[14px] text-[#4d4d4d] text-center m-0 leading-[24px]" style={fontRegular}>
            Дозволені типи файлів: .rar .zip .docx .pdf .pptx .png .jpg
          </p>

          {(hasFiles || existingFiles.length > 0) && (
            <div className="flex flex-wrap gap-[8px] justify-start w-full">
              {existingFiles.map((ef) => (
                <FileChip key={`existing-${ef.fileId}`} name={ef.fileName} onRemove={() => removeExistingFile(ef.fileId)} />
              ))}
              {files.map((file, index) => (
                <FileChip key={`new-${file.name}-${index}`} name={file.name} onRemove={() => removeFile(index)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scenario name input */}
      <div className="h-[52px] relative rounded-[12px] shrink-0 w-full">
        <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
        <input
          type="text"
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          placeholder="Введіть назву матеріалу..."
          className="w-full h-full bg-transparent border-none outline-none px-[16px] py-[4px] text-[16px] text-[#0d0d0d] placeholder-[#4d4d4d] rounded-[12px]"
          style={fontRegular}
        />
      </div>

      {/* Holiday + Age group row */}
      <div className="flex gap-[24px] items-start shrink-0 w-full">
        <MultiSelect
          options={eventOptions}
          selected={selectedEventIds}
          onChange={setSelectedEventIds}
          placeholder="Оберіть свято"
          disabled={isMetadataLoading}
        />
        <MultiSelect
          options={ageCategories}
          selected={selectedAgeCategoryIds}
          onChange={setSelectedAgeCategoryIds}
          placeholder="Оберіть вікові групи"
          disabled={isMetadataLoading}
        />
      </div>

      {/* Content type + Price row */}
      <div className="flex gap-[24px] items-start shrink-0 w-full">
        <div className="flex-1 h-[52px] relative rounded-[12px]">
          <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
          <div className="flex items-center size-full px-[16px] py-[4px] gap-[8px]">
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              disabled={isMetadataLoading}
              className="flex-1 bg-transparent border-none outline-none text-[16px] text-[#4d4d4d] appearance-none cursor-pointer disabled:cursor-not-allowed"
              style={fontRegular}
            >
              <option value="" disabled>{isMetadataLoading ? 'Завантаження...' : 'Оберіть тип контенту'}</option>
              {types.map((t) => (
                <option key={t.id} value={String(t.id)}>{t.name}</option>
              ))}
            </select>
            <div className="shrink-0 w-[24px] h-[24px] pointer-events-none">
              <svg className="block size-full" fill="none" viewBox="0 0 12 8">
                <path d={iconPaths.keyboardArrowDown} fill="#4D4D4D" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex-1 h-[52px] relative rounded-[12px]">
          <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Введіть ціну..."
            className="w-full h-full bg-transparent border-none outline-none px-[16px] py-[4px] text-[16px] text-[#0d0d0d] placeholder-[#4d4d4d] rounded-[12px]"
            style={fontRegular}
          />
        </div>
      </div>

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
          onClick={handleContinue}
          className="bg-[#5e89e8] h-[44px] px-[24px] py-[12px] rounded-[12px] border-none cursor-pointer text-[16px] text-white hover:opacity-90 transition-opacity"
          style={fontRegular}
        >
          Продовжити
        </button>
      </div>
    </div>
  );
}
