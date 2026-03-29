import { useState, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, Save } from 'lucide-react';

interface AdminEditMaterialProps {
  materialId: string | null;
  onSectionChange: (section: string) => void;
}

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };

const MOCK_MATERIAL_DATA: Record<string, { name: string; ageGroup: string; description: string; quantity: string }> = {
  '1': { name: '1 Вересня – Побувайте на святі, що в новому форматі', ageGroup: 'junior', description: 'Сценарій свята на 1 вересня для школи.', quantity: '10' },
  '2': { name: 'Авторський квест «Подорож країнами світу». Для літнього табору.', ageGroup: 'middle', description: 'Квест для дітей 8-12 років, тематика — подорожі.', quantity: '5' },
  '3': { name: 'День Вишиванки', ageGroup: 'preschool', description: 'Матеріали до Дня Вишиванки.', quantity: '15' },
  '4': { name: 'День матері', ageGroup: 'junior', description: 'Святковий сценарій до Дня матері з віршами та піснями.', quantity: '8' },
};

export function AdminEditMaterial({ materialId, onSectionChange }: AdminEditMaterialProps) {
  const prefill = materialId ? MOCK_MATERIAL_DATA[materialId] : null;

  const [images, setImages] = useState<File[]>([]);
  const [materialName, setMaterialName] = useState(prefill?.name ?? '');
  const [ageGroup, setAgeGroup] = useState(prefill?.ageGroup ?? '');
  const [description, setDescription] = useState(prefill?.description ?? '');
  const [quantity, setQuantity] = useState(prefill?.quantity ?? '');
  const [isDragOver, setIsDragOver] = useState(false);

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
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );
    setImages((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSectionChange('materials');
  };

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] p-[20px] flex flex-col gap-[20px] overflow-y-auto"
      data-name="AdminEditMaterial"
    >
      {/* Image upload drag-drop area */}
      <div
        className={`border-2 border-dashed rounded-[12px] p-[48px] min-h-[280px] flex flex-col items-center justify-center gap-[16px] transition-colors cursor-pointer ${
          isDragOver ? 'border-[#5e89e8] bg-[#5e89e8]/5' : 'border-[#4d4d4d] hover:border-[#5e89e8]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload size={48} color="#4d4d4d" />
        <p className="text-[18px] text-[#4d4d4d] text-center m-0" style={fontBold}>
          Перетягніть зображення сюди
        </p>
        <p className="text-[14px] text-[#4d4d4d] text-center m-0" style={fontRegular}>
          або
        </p>
        <label className="bg-white border border-solid border-[#4d4d4d] rounded-[12px] h-[44px] px-[24px] flex items-center justify-center cursor-pointer text-[16px] text-[#0d0d0d] hover:bg-gray-50 transition-colors" style={fontRegular}>
          Оберіть файли
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-[8px] mt-[8px]">
            {images.map((file, index) => (
              <div key={index} className="relative bg-white rounded-[8px] px-[12px] py-[6px] flex items-center gap-[8px] border border-solid border-[#e6e6e6]">
                <span className="text-[14px] text-[#0d0d0d] max-w-[150px] truncate" style={fontRegular}>
                  {file.name}
                </span>
                <button
                  onClick={() => removeImage(index)}
                  className="bg-transparent border-none p-0 cursor-pointer hover:opacity-70"
                >
                  <X size={16} color="#e53935" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Material name input */}
      <div className="relative">
        <label className="block text-[14px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>
          Назва матеріалу
        </label>
        <div className="bg-[#f2f2f2] h-[52px] relative rounded-[12px]">
          <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
          <input
            type="text"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            placeholder="Введіть назву матеріалу..."
            className="w-full h-full bg-transparent border-none outline-none px-[16px] py-[4px] text-[16px] text-[#0d0d0d] placeholder-[#4d4d4d] rounded-[12px]"
            style={fontRegular}
          />
        </div>
      </div>

      {/* Age group select */}
      <div className="relative">
        <label className="block text-[14px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>
          Вікова група
        </label>
        <div className="bg-[#f2f2f2] h-[52px] relative rounded-[12px]">
          <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full h-full bg-transparent border-none outline-none px-[16px] py-[4px] text-[16px] text-[#0d0d0d] appearance-none cursor-pointer rounded-[12px]"
            style={fontRegular}
          >
            <option value="" disabled>Оберіть вікову групу</option>
            <option value="preschool">Дошкільний вік</option>
            <option value="junior">Молодший шкільний вік</option>
            <option value="middle">Середній шкільний вік</option>
            <option value="senior">Старший шкільний вік</option>
          </select>
        </div>
      </div>

      {/* Description textarea */}
      <div className="relative">
        <label className="block text-[14px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>
          Опис
        </label>
        <div className="bg-[#f2f2f2] relative rounded-[12px]">
          <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
          <textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введіть опис матеріалу..."
            className="w-full bg-transparent border-none outline-none px-[16px] py-[12px] text-[16px] text-[#0d0d0d] placeholder-[#4d4d4d] rounded-[12px] resize-none"
            style={fontRegular}
          />
        </div>
      </div>

      {/* Quantity input */}
      <div className="relative">
        <label className="block text-[14px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>
          Кількість
        </label>
        <div className="bg-[#f2f2f2] h-[52px] relative rounded-[12px]">
          <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Введіть кількість..."
            className="w-full h-full bg-transparent border-none outline-none px-[16px] py-[4px] text-[16px] text-[#0d0d0d] placeholder-[#4d4d4d] rounded-[12px]"
            style={fontRegular}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-[16px] items-center justify-end shrink-0 w-full">
        <button
          onClick={() => onSectionChange('materials')}
          className="h-[44px] px-[24px] py-[12px] rounded-[12px] border-none bg-transparent cursor-pointer text-[16px] text-[#4d4d4d] underline hover:text-[#0d0d0d] transition-colors"
          style={fontRegular}
        >
          Повернутись
        </button>
        <button
          onClick={handleSave}
          className="bg-[#4CAF50] h-[44px] px-[24px] py-[12px] rounded-[12px] border-none cursor-pointer text-[16px] text-white hover:opacity-90 transition-opacity flex items-center gap-[8px]"
          style={fontBold}
        >
          <Save size={18} />
          Зберегти зміни
        </button>
      </div>
    </div>
  );
}
