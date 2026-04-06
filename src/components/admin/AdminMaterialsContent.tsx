import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { iconPaths } from '../ui/icons/iconPaths';
import { Table, TextCell, TableCell } from '../layout/dashboard/TableComponents';
import { apiService } from '@/services/api';
import { Product } from '@/types';

interface AdminMaterialsContentProps {
  onSectionChange: (section: string) => void;
  onEditMaterial: (id: string) => void;
}

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };

const getRowBg = (index: number) => index % 2 === 0 ? '#f2f2f2' : '#e6e6e6';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};

export function AdminMaterialsContent({ onSectionChange, onEditMaterial }: AdminMaterialsContentProps) {
  const [materials, setMaterials] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        apiService.clearProductsCache();
        const data = await apiService.getProducts();
        setMaterials(data);
      } catch {
        setError('Не вдалося завантажити матеріали. Спробуйте оновити сторінку.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async () => {
    if (deleteId === null) { return; }
    try {
      await apiService.adminDeleteProduct(deleteId);
      setMaterials((prev) => prev.filter((m) => m.id !== deleteId));
      setDeleteId(null);
    } catch {
      toast.error('Не вдалося видалити матеріал. Спробуйте ще раз.');
      setDeleteId(null);
    }
  };

  const tableColumns = [
    {
      header: 'Назва Матеріалу',
      width: 1,
      minWidth: '200px',
      cells: materials.map((item, index) => (
        <TextCell key={`name-${item.id}`} text={item.title} bg={getRowBg(index)} />
      ))
    },
    {
      header: 'Тип Матеріалу',
      width: '148px',
      cells: materials.map((item, index) => (
        <TextCell key={`type-${item.id}`} text={item.type} bg={getRowBg(index)} centered />
      ))
    },
    {
      header: 'Дата Публікації',
      width: '155px',
      cells: materials.map((item, index) => (
        <TextCell key={`date-${item.id}`} text={formatDate(item.createdAt)} bg={getRowBg(index)} centered />
      ))
    },
    {
      header: 'Дії',
      width: '96px',
      cells: materials.map((item, index) => (
        <TableCell key={`action-${item.id}`} bg={getRowBg(index)}>
          <div className="flex items-center justify-center gap-[16px] w-full h-[40px]">
            <button
              onClick={() => onEditMaterial(String(item.id))}
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
      ))
    }
  ];

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] p-[24px] flex flex-col gap-[16px] self-stretch"
      data-name="AdminMaterialsContent"
    >
      {/* Table */}
      <div className="flex-1 min-h-0 relative rounded-[12px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[16px] text-[#4d4d4d]" style={fontRegular}>Завантаження...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[16px] text-[#e53935]" style={fontRegular}>{error}</p>
          </div>
        ) : (
          <Table columns={tableColumns} />
        )}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[24px] p-[32px] flex flex-col gap-[24px] max-w-[764px] mx-[24px]">
            <h5 className="text-[40px] text-[#0d0d0d] text-center m-0" style={fontRegular}>
              Ви впевнені, що хочете видалити цей матеріал?
            </h5>
            <p className="text-[20px] text-[#4d4d4d] text-center m-0" style={fontRegular}>
              Якщо Ви натиснете “Підтвердити”, цей матеріал буде повністю видалено і цю дію неможливо буде відмінити
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
                className="h-[44px] px-[24px] rounded-[12px] border-none bg-[#E53935] text-white cursor-pointer text-[16px] hover:opacity-90 transition-opacity"
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
