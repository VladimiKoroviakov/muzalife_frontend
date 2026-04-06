
import { useState, useEffect } from 'react';
import { Table, TextCell, TableCell } from '../layout/dashboard/TableComponents';
import { apiService } from '@/services/api';
import { PersonalOrder } from '@/types';

interface AdminOrdersContentProps {
  onSectionChange: (section: string) => void;
  onViewOrder: (id: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Не підтверджено',
  in_progress: 'Розробляється',
  completed: 'Виконано',
  cancelled: 'Скасовано',
  approved: 'Підтверджено',
  rejected: 'Відхилено',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#ff7b00',
  in_progress: '#5e89e8',
  completed: '#4caf50',
  cancelled: '#e53935',
  approved: '#4caf50',
  rejected: '#e53935',
};

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };

const getRowBg = (index: number) => index % 2 === 0 ? '#f2f2f2' : '#e6e6e6';

const formatDeadline = (iso: string | null): string => {
  if (!iso) { return '—'; }
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};

export function AdminOrdersContent({ onSectionChange, onViewOrder }: AdminOrdersContentProps) {
  void onSectionChange;

  const [orders, setOrders] = useState<PersonalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiService.adminGetAllPersonalOrders();
        setOrders(data);
      } catch {
        setError('Не вдалося завантажити замовлення. Спробуйте оновити сторінку.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const tableColumns = [
    {
      header: 'Назва Замовлення',
      width: 1,
      minWidth: '200px',
      cells: orders.map((item, index) => (
        <TextCell key={`name-${item.order_id}`} text={item.order_title} bg={getRowBg(index)} />
      ))
    },
    {
      header: 'Статус',
      width: '170px',
      cells: orders.map((item, index) => (
        <TextCell
          key={`status-${item.order_id}`}
          text={STATUS_LABELS[item.order_status] ?? item.order_status}
          bg={getRowBg(index)}
          bold={item.order_status === 'pending'}
          color={STATUS_COLORS[item.order_status] ?? '#4d4d4d'}
          centered
        />
      ))
    },
    {
      header: 'Дедлайн Замовлення',
      width: '211px',
      cells: orders.map((item, index) => (
        <TextCell
          key={`deadline-${item.order_id}`}
          text={formatDeadline(item.order_deadline)}
          bg={getRowBg(index)}
          centered
        />
      ))
    },
    {
      header: 'Дії',
      width: '141px',
      cells: orders.map((item, index) => (
        <TableCell key={`action-${item.order_id}`} bg={getRowBg(index)}>
          <div className="flex items-center justify-center w-full h-[40px] px-[16px]">
            <button
              onClick={() => onViewOrder(String(item.order_id))}
              className="underline cursor-pointer bg-transparent border-none p-0 text-[16px] hover:opacity-70 transition-opacity"
              style={{
                color: item.order_status === 'pending' ? '#ff7b00' : '#5e89e8',
                fontVariationSettings: `'CTGR' 0, 'wdth' 100, 'wght' ${item.order_status === 'pending' ? 700 : 400}`
              }}
            >
              {item.order_status === 'pending' ? 'Підтвердити' : 'Переглянути'}
            </button>
          </div>
        </TableCell>
      ))
    }
  ];

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] p-[24px] flex flex-col self-stretch"
      data-name="AdminOrdersContent"
    >
      <div className="flex-1 min-h-0 relative rounded-[12px] overflow-auto">
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
    </div>
  );
}
