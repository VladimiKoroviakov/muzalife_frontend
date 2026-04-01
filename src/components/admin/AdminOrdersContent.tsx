
import { Table, TextCell, EmptyCell, TableCell } from '../cabinet/TableComponents';

interface OrderItem {
  id: string;
  title: string;
  status: 'processing' | 'pending' | 'developing' | 'rejected' | 'completed';
  deadline: string;
}

interface AdminOrdersContentProps {
  onSectionChange: (section: string) => void;
  onViewOrder: (id: string) => void;
}

const STATUS_LABELS: Record<OrderItem['status'], string> = {
  processing: 'В обробці',
  pending: 'Не підтверджено',
  developing: 'Розробляється',
  rejected: 'Відхилено',
  completed: 'Виконано',
};

const STATUS_COLORS: Record<OrderItem['status'], string> = {
  processing: '#4d4d4d',
  pending: '#ff7b00',
  developing: '#5e89e8',
  rejected: '#e53935',
  completed: '#4caf50',
};

const MOCK_ORDERS: OrderItem[] = [
  { id: '1', title: 'Авторський квест «Подорож країнами світу». Для літнього табору.', status: 'processing', deadline: '03.11.2025' },
  { id: '2', title: '1 Вересня – Побувайте на святі, що в новому форматі', status: 'pending', deadline: '01.12.2025' },
  { id: '3', title: 'Авторський квест «Подорож країнами світу». Для літнього табору.', status: 'developing', deadline: '03.11.2025' },
  { id: '4', title: 'День Вишиванки', status: 'rejected', deadline: '12.09.2025' },
  { id: '5', title: 'День матері', status: 'completed', deadline: '07.08.2025' },
];

const EMPTY_ROWS_COUNT = 17;

const getRowBg = (index: number) => index % 2 === 0 ? '#f2f2f2' : '#e6e6e6';

export function AdminOrdersContent({ onSectionChange, onViewOrder }: AdminOrdersContentProps) {

  void onSectionChange;

  const tableColumns = [
    {
      header: 'Назва Замовлення',
      width: 1,
      minWidth: '200px',
      cells: [
        ...MOCK_ORDERS.map((item, index) => (
          <TextCell key={`name-${item.id}`} text={item.title} bg={getRowBg(index)} />
        )),
        ...Array.from({ length: EMPTY_ROWS_COUNT }, (_, i) => (
          <EmptyCell key={`empty-name-${i}`} bg={getRowBg(MOCK_ORDERS.length + i)} />
        ))
      ]
    },
    {
      header: 'Статус',
      width: '170px',
      cells: [
        ...MOCK_ORDERS.map((item, index) => (
          <TextCell
            key={`status-${item.id}`}
            text={STATUS_LABELS[item.status]}
            bg={getRowBg(index)}
            bold={item.status === 'pending'}
            color={STATUS_COLORS[item.status]}
            centered
          />
        )),
        ...Array.from({ length: EMPTY_ROWS_COUNT }, (_, i) => (
          <EmptyCell key={`empty-status-${i}`} bg={getRowBg(MOCK_ORDERS.length + i)} />
        ))
      ]
    },
    {
      header: 'Дедлайн Замовлення',
      width: '211px',
      cells: [
        ...MOCK_ORDERS.map((item, index) => (
          <TextCell
            key={`deadline-${item.id}`}
            text={item.deadline}
            bg={getRowBg(index)}
            centered
          />
        )),
        ...Array.from({ length: EMPTY_ROWS_COUNT }, (_, i) => (
          <EmptyCell key={`empty-deadline-${i}`} bg={getRowBg(MOCK_ORDERS.length + i)} />
        ))
      ]
    },
    {
      header: 'Дії',
      width: '141px',
      cells: [
        ...MOCK_ORDERS.map((item, index) => (
          <TableCell key={`action-${item.id}`} bg={getRowBg(index)}>
            <div className="flex items-center justify-center w-full h-[40px] px-[16px]">
              <button
                onClick={() => onViewOrder(item.id)}
                className="underline cursor-pointer bg-transparent border-none p-0 text-[16px] hover:opacity-70 transition-opacity"
                style={{
                  color: item.status === 'pending' ? '#ff7b00' : '#5e89e8',
                  fontVariationSettings: `'CTGR' 0, 'wdth' 100, 'wght' ${item.status === 'pending' ? 700 : 400}`
                }}
              >
                {item.status === 'pending' ? 'Підтвердити' : 'Переглянути'}
              </button>
            </div>
          </TableCell>
        )),
        ...Array.from({ length: EMPTY_ROWS_COUNT }, (_, i) => (
          <EmptyCell key={`empty-action-${i}`} bg={getRowBg(MOCK_ORDERS.length + i)} />
        ))
      ]
    }
  ];

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] p-[24px] flex flex-col self-stretch"
      data-name="AdminOrdersContent"
    >
      <div className="flex-1 min-h-0 relative rounded-[12px] overflow-auto">
        <Table columns={tableColumns} />
      </div>
    </div>
  );
}
