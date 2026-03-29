import { useState } from 'react';
import { iconPaths } from '../ui/icons/iconPaths';

interface MaterialItem {
  id: string;
  title: string;
  type: string;
  date: string;
}

interface AdminMaterialsContentProps {
  onSectionChange: (section: string) => void;
  onEditMaterial: (id: string) => void;
}

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };

const MOCK_MATERIALS: MaterialItem[] = [
  { id: '1', title: '1 Вересня – Побувайте на святі, що в новому форматі', type: 'Сценарій', date: '01.12.2025' },
  { id: '2', title: 'Авторський квест «Подорож країнами світу». Для літнього табору.', type: 'Квест', date: '03.11.2025' },
  { id: '3', title: 'День Вишиванки', type: 'Інше', date: '12.09.2025' },
  { id: '4', title: 'День матері', type: 'Поезія', date: '07.08.2025' },
];

const EMPTY_ROWS_COUNT = 20;

export function AdminMaterialsContent({ onSectionChange, onEditMaterial }: AdminMaterialsContentProps) {
  const [materials, setMaterials] = useState<MaterialItem[]>(MOCK_MATERIALS);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      setMaterials((prev) => prev.filter((m) => m.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] p-[24px] flex flex-col gap-[16px]"
      data-name="AdminMaterialsContent"
    >
      {/* Table — scrolls vertically, header stays sticky */}
      <div className="flex-1 min-h-0 border border-solid border-white rounded-[12px] overflow-y-auto flex">

        {/* Column 1: Name */}
        <div className="flex-1 min-w-0 border-r-2 border-solid border-white flex flex-col">
          <div
            className="h-[40px] bg-[#5e89e8] flex items-center px-[16px] text-white text-[18px] sticky top-0 z-10 shrink-0"
            style={fontBold}
          >
            Назва Матеріалу
          </div>
          {materials.map((item, index) => (
            <div
              key={item.id}
              className={`h-[40px] flex items-center px-[16px] text-[16px] text-[#0d0d0d] truncate shrink-0 ${
                index % 2 === 0 ? 'bg-[#f2f2f2]' : 'bg-[#e6e6e6]'
              }`}
              style={fontRegular}
            >
              {item.title}
            </div>
          ))}
          {Array.from({ length: EMPTY_ROWS_COUNT }).map((_, i) => (
            <div
              key={`empty-name-${i}`}
              className={`h-[40px] shrink-0 ${
                (materials.length + i) % 2 === 0 ? 'bg-[#f2f2f2]' : 'bg-[#e6e6e6]'
              }`}
            />
          ))}
        </div>

        {/* Column 2: Type */}
        <div className="w-[148px] shrink-0 border-r-2 border-solid border-white flex flex-col">
          <div
            className="h-[40px] bg-[#5e89e8] flex items-center justify-center text-white text-[18px] sticky top-0 z-10 shrink-0"
            style={fontBold}
          >
            Тип Матеріалу
          </div>
          {materials.map((item, index) => (
            <div
              key={item.id}
              className={`h-[40px] flex items-center justify-center text-[16px] text-[#0d0d0d] shrink-0 ${
                index % 2 === 0 ? 'bg-[#f2f2f2]' : 'bg-[#e6e6e6]'
              }`}
              style={fontRegular}
            >
              {item.type}
            </div>
          ))}
          {Array.from({ length: EMPTY_ROWS_COUNT }).map((_, i) => (
            <div
              key={`empty-type-${i}`}
              className={`h-[40px] shrink-0 ${
                (materials.length + i) % 2 === 0 ? 'bg-[#f2f2f2]' : 'bg-[#e6e6e6]'
              }`}
            />
          ))}
        </div>

        {/* Column 3: Date */}
        <div className="w-[155px] shrink-0 border-r-2 border-solid border-white flex flex-col">
          <div
            className="h-[40px] bg-[#5e89e8] flex items-center justify-center text-white text-[18px] sticky top-0 z-10 shrink-0"
            style={fontBold}
          >
            Дата Публікації
          </div>
          {materials.map((item, index) => (
            <div
              key={item.id}
              className={`h-[40px] flex items-center justify-center text-[16px] text-[#0d0d0d] shrink-0 ${
                index % 2 === 0 ? 'bg-[#f2f2f2]' : 'bg-[#e6e6e6]'
              }`}
              style={fontRegular}
            >
              {item.date}
            </div>
          ))}
          {Array.from({ length: EMPTY_ROWS_COUNT }).map((_, i) => (
            <div
              key={`empty-date-${i}`}
              className={`h-[40px] shrink-0 ${
                (materials.length + i) % 2 === 0 ? 'bg-[#f2f2f2]' : 'bg-[#e6e6e6]'
              }`}
            />
          ))}
        </div>

        {/* Column 4: Actions */}
        <div className="w-[96px] shrink-0 flex flex-col">
          <div
            className="h-[40px] bg-[#5e89e8] flex items-center justify-center text-white text-[18px] sticky top-0 z-10 shrink-0"
            style={fontBold}
          >
            Дії
          </div>
          {materials.map((item, index) => (
            <div
              key={item.id}
              className={`h-[40px] flex items-center justify-center gap-[16px] shrink-0 ${
                index % 2 === 0 ? 'bg-[#f2f2f2]' : 'bg-[#e6e6e6]'
              }`}
            >
              <button
                onClick={() => onEditMaterial(item.id)}
                className="hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none p-0"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d={iconPaths.editAdmin} fill="#0d0d0d" />
                </svg>
              </button>
              <button
                onClick={() => setDeleteId(item.id)}
                className="hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-none p-0"
              >
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                  <path d={iconPaths.deleteAdmin} fill="#0d0d0d" />
                </svg>
              </button>
            </div>
          ))}
          {Array.from({ length: EMPTY_ROWS_COUNT }).map((_, i) => (
            <div
              key={`empty-actions-${i}`}
              className={`h-[40px] shrink-0 ${
                (materials.length + i) % 2 === 0 ? 'bg-[#f2f2f2]' : 'bg-[#e6e6e6]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Add button */}
      <div className="flex justify-end shrink-0">
        <button
          onClick={() => onSectionChange('materials-add')}
          className="flex items-center gap-[8px] bg-white border border-solid border-[#4d4d4d] rounded-[12px] h-[44px] px-[24px] text-[16px] text-[#0d0d0d] cursor-pointer hover:bg-[#f5f5f5] transition-colors"
          style={fontRegular}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d={iconPaths.addMaterial} fill="#0d0d0d" />
          </svg>
          Додати новий матеріал
        </button>
      </div>

      {/* Delete confirmation modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-[#0d0d0d]/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[24px] p-[32px] flex flex-col gap-[24px] max-w-[480px] w-full mx-[24px]">
            <p className="text-[18px] text-[#0d0d0d] text-center m-0" style={fontRegular}>
              Ви впевнені, що хочете видалити цей матеріал? Цю дію неможливо скасувати.
            </p>
            <div className="flex gap-[16px] justify-center">
              <button
                onClick={() => setDeleteId(null)}
                className="h-[44px] px-[24px] rounded-[12px] border border-solid border-[#4d4d4d] bg-white cursor-pointer text-[16px] text-[#0d0d0d] hover:bg-[#f5f5f5] transition-colors"
                style={fontRegular}
              >
                Повернутись
              </button>
              <button
                onClick={handleDelete}
                className="h-[44px] px-[24px] rounded-[12px] border-none bg-[#e53935] text-white cursor-pointer text-[16px] hover:opacity-90 transition-opacity"
                style={fontBold}
              >
                Підтвердити видалення
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
