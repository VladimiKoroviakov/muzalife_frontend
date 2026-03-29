import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { iconPaths } from '../ui/icons/iconPaths';

interface AdminAddMaterialProps {
  onSectionChange: (section: string) => void;
}

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };

export function AdminAddMaterial({ onSectionChange }: AdminAddMaterialProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [holidayName, setHolidayName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [contentType, setContentType] = useState('');
  const [price, setPrice] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleCancel = () => {
    onSectionChange('materials');
  };

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] flex flex-col justify-between p-[20px] h-full"
      data-name="AdminAddMaterial"
    >
      {/* Drag & Drop area */}
      <div
        className="h-[372px] relative rounded-[12px] shrink-0 w-full"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          aria-hidden="true"
          className={`absolute border border-dashed inset-0 pointer-events-none rounded-[12px] ${
            isDragOver ? 'border-[#5e89e8]' : 'border-[#4d4d4d]'
          }`}
        />
        <div className="flex flex-col items-center justify-center size-full px-[48px] py-[40px] gap-[16px]">
          {/* Upload icon */}
          <div className="relative shrink-0 w-[112px] h-[112px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 94 75">
              <path d={iconPaths.driveFolderUpload} fill="#1C1B1F" />
            </svg>
          </div>

          <p className="text-[24px] text-[#0d0d0d] text-center m-0 leading-[24px]" style={fontBold}>
            Перетягніть файли (матеріали для відправки) сюди
          </p>

          <p className="text-[16px] text-[#4d4d4d] text-center m-0 leading-[24px]" style={fontRegular}>
            або
          </p>

          {files.length > 0 && (
            <p className="text-[14px] text-[#5e89e8] text-center m-0" style={fontRegular}>
              Обрано файлів: {files.length}
            </p>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white box-border flex items-center justify-center gap-[8px] h-[44px] px-[24px] py-[12px] rounded-[12px] border border-solid border-[#0d0d0d] cursor-pointer text-[16px] text-[#0d0d0d] hover:bg-gray-50 transition-colors"
            style={fontRegular}
          >
            Оберіть файли
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".rar,.zip,.docx,.pdf,.pptx,.png,.jpg"
            className="hidden"
            onChange={handleFileChange}
          />

          <p className="text-[16px] text-[#4d4d4d] text-center m-0 leading-[24px]" style={fontRegular}>
            Дозволені типи файлів: .rar .zip .docx .pdf .pptx .png .jpg
          </p>
        </div>
      </div>

      {/* Holiday name input */}
      <div className="bg-[#f2f2f2] h-[52px] relative rounded-[12px] shrink-0 w-full">
        <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
        <input
          type="text"
          value={holidayName}
          onChange={(e) => setHolidayName(e.target.value)}
          placeholder="Введіть назву свята..."
          className="w-full h-full bg-transparent border-none outline-none px-[16px] py-[4px] text-[16px] text-[#0d0d0d] placeholder-[#4d4d4d] rounded-[12px]"
          style={fontRegular}
        />
      </div>

      {/* Age group select */}
      <div className="bg-[#f2f2f2] h-[52px] relative rounded-[12px] shrink-0 w-full">
        <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
        <div className="flex items-center size-full px-[16px] py-[4px] gap-[8px]">
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[16px] text-[#4d4d4d] appearance-none cursor-pointer"
            style={fontRegular}
          >
            <option value="" disabled>Оберіть вікові групи</option>
            <option value="preschool">Дошкільний вік</option>
            <option value="junior">Молодший шкільний вік</option>
            <option value="middle">Середній шкільний вік</option>
            <option value="senior">Старший шкільний вік</option>
          </select>
          <div className="shrink-0 w-[24px] h-[24px] pointer-events-none">
            <svg className="block size-full" fill="none" viewBox="0 0 12 8">
              <path d={iconPaths.keyboardArrowDown} fill="#4D4D4D" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content type + Price row */}
      <div className="flex gap-[24px] items-start shrink-0 w-full">
        {/* Content type select */}
        <div className="flex-1 bg-[#f2f2f2] h-[52px] relative rounded-[12px]">
          <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
          <div className="flex items-center size-full px-[16px] py-[4px] gap-[8px]">
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[16px] text-[#4d4d4d] appearance-none cursor-pointer"
              style={fontRegular}
            >
              <option value="" disabled>Оберіть тип контенту</option>
              <option value="scenario">Сценарій</option>
              <option value="quest">Квест</option>
              <option value="poetry">Поезія</option>
              <option value="other">Інше</option>
            </select>
            <div className="shrink-0 w-[24px] h-[24px] pointer-events-none">
              <svg className="block size-full" fill="none" viewBox="0 0 12 8">
                <path d={iconPaths.keyboardArrowDown} fill="#4D4D4D" />
              </svg>
            </div>
          </div>
        </div>

        {/* Price input */}
        <div className="flex-1 bg-[#f2f2f2] h-[52px] relative rounded-[12px]">
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
          onClick={handleCancel}
          className="h-[44px] px-[24px] py-[12px] rounded-[12px] border-none bg-transparent cursor-pointer text-[16px] text-[#e53935] underline"
          style={fontRegular}
        >
          Скасувати
        </button>
        <button
          className="bg-[#5e89e8] h-[44px] px-[24px] py-[12px] rounded-[12px] border-none cursor-pointer text-[16px] text-white hover:opacity-90 transition-opacity"
          style={fontRegular}
        >
          Продовжити
        </button>
      </div>
    </div>
  );
}
