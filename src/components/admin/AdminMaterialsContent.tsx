import { useState } from 'react';
import { iconPaths } from '../ui/icons/iconPaths';
import { Table, TextCell, EmptyCell, TableCell } from '../layout/dashboard/TableComponents';

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

const getRowBg = (index: number) => index % 2 === 0 ? '#f2f2f2' : '#e6e6e6';

export function AdminMaterialsContent({ onSectionChange, onEditMaterial }: AdminMaterialsContentProps) {
  const [materials, setMaterials] = useState<MaterialItem[]>(MOCK_MATERIALS);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      setMaterials((prev) => prev.filter((m) => m.id !== deleteId));
      setDeleteId(null);
    }
  };

  const tableColumns = [
    {
      header: 'Назва Матеріалу',
      width: 1,
      minWidth: '200px',
      cells: [
        ...materials.map((item, index) => (
          <TextCell key={`name-${item.id}`} text={item.title} bg={getRowBg(index)} />
        )),
        ...Array.from({ length: EMPTY_ROWS_COUNT }, (_, i) => (
          <EmptyCell key={`empty-name-${i}`} bg={getRowBg(materials.length + i)} />
        ))
      ]
    },
    {
      header: 'Тип Матеріалу',
      width: '148px',
      cells: [
        ...materials.map((item, index) => (
          <TextCell key={`type-${item.id}`} text={item.type} bg={getRowBg(index)} centered />
        )),
        ...Array.from({ length: EMPTY_ROWS_COUNT }, (_, i) => (
          <EmptyCell key={`empty-type-${i}`} bg={getRowBg(materials.length + i)} />
        ))
      ]
    },
    {
      header: 'Дата Публікації',
      width: '155px',
      cells: [
        ...materials.map((item, index) => (
          <TextCell key={`date-${item.id}`} text={item.date} bg={getRowBg(index)} centered />
        )),
        ...Array.from({ length: EMPTY_ROWS_COUNT }, (_, i) => (
          <EmptyCell key={`empty-date-${i}`} bg={getRowBg(materials.length + i)} />
        ))
      ]
    },
    {
      header: 'Дії',
      width: '96px',
      cells: [
        ...materials.map((item, index) => (
          <TableCell key={`action-${item.id}`} bg={getRowBg(index)}>
            <div className="flex items-center justify-center gap-[16px] w-full h-[40px]">
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
          </TableCell>
        )),
        ...Array.from({ length: EMPTY_ROWS_COUNT }, (_, i) => (
          <EmptyCell key={`empty-action-${i}`} bg={getRowBg(materials.length + i)} />
        ))
      ]
    }
  ];

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] p-[24px] flex flex-col gap-[16px] self-stretch"
      data-name="AdminMaterialsContent"
    >
      {/* Table */}
      <div className="flex-1 min-h-0 relative rounded-[12px] overflow-y-auto">
        <Table columns={tableColumns} />
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
