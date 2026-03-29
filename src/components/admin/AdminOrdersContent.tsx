
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

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };

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

export function AdminOrdersContent({ onSectionChange, onViewOrder }: AdminOrdersContentProps) {

  void onSectionChange;

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] p-[24px] flex flex-col"
      data-name="AdminOrdersContent"
    >
      {/* Table */}
      <div className="border border-solid border-white rounded-[12px] overflow-hidden flex">
        {/* Column 1: Order Name */}
        <div className="flex-1 min-w-0 border-r border-solid border-white">
          <div
            className="h-[40px] bg-[#5e89e8] flex items-center px-[16px] text-white text-[18px] sticky top-0"
            style={fontBold}
          >
            Назва Замовлення
          </div>
          {MOCK_ORDERS.map((item, index) => (
            <div
              key={item.id}
              className={`h-[40px] flex items-center px-[16px] text-[16px] text-[#0d0d0d] truncate ${
                index % 2 === 0 ? 'bg-[#e6e6e6]' : 'bg-[#f2f2f2]'
              }`}
              style={fontRegular}
            >
              {item.title}
            </div>
          ))}
          {Array.from({ length: EMPTY_ROWS_COUNT }).map((_, i) => (
            <div
              key={`empty-name-${i}`}
              className={`h-[40px] ${
                (MOCK_ORDERS.length + i) % 2 === 0 ? 'bg-[#e6e6e6]' : 'bg-[#f2f2f2]'
              }`}
            />
          ))}
        </div>

        {/* Column 2: Status */}
        <div className="w-[170px] shrink-0 border-r border-solid border-white">
          <div
            className="h-[40px] bg-[#5e89e8] flex items-center justify-center text-white text-[18px] sticky top-0"
            style={fontBold}
          >
            Статус
          </div>
          {MOCK_ORDERS.map((item, index) => (
            <div
              key={item.id}
              className={`h-[40px] flex items-center justify-center text-[16px] ${
                index % 2 === 0 ? 'bg-[#e6e6e6]' : 'bg-[#f2f2f2]'
              }`}
              style={
                item.status === 'pending'
                  ? { color: STATUS_COLORS[item.status], ...fontBold }
                  : { color: STATUS_COLORS[item.status], ...fontRegular }
              }
            >
              {STATUS_LABELS[item.status]}
            </div>
          ))}
          {Array.from({ length: EMPTY_ROWS_COUNT }).map((_, i) => (
            <div
              key={`empty-status-${i}`}
              className={`h-[40px] ${
                (MOCK_ORDERS.length + i) % 2 === 0 ? 'bg-[#e6e6e6]' : 'bg-[#f2f2f2]'
              }`}
            />
          ))}
        </div>

        {/* Column 3: Deadline */}
        <div className="w-[211px] shrink-0 border-r border-solid border-white">
          <div
            className="h-[40px] bg-[#5e89e8] flex items-center justify-center text-white text-[18px] sticky top-0"
            style={fontBold}
          >
            Дедлайн Замовлення
          </div>
          {MOCK_ORDERS.map((item, index) => (
            <div
              key={item.id}
              className={`h-[40px] flex items-center justify-center text-[16px] text-[#0d0d0d] ${
                index % 2 === 0 ? 'bg-[#e6e6e6]' : 'bg-[#f2f2f2]'
              }`}
              style={fontRegular}
            >
              {item.deadline}
            </div>
          ))}
          {Array.from({ length: EMPTY_ROWS_COUNT }).map((_, i) => (
            <div
              key={`empty-deadline-${i}`}
              className={`h-[40px] ${
                (MOCK_ORDERS.length + i) % 2 === 0 ? 'bg-[#e6e6e6]' : 'bg-[#f2f2f2]'
              }`}
            />
          ))}
        </div>

        {/* Column 4: Actions */}
        <div className="w-[141px] shrink-0">
          <div
            className="h-[40px] bg-[#5e89e8] flex items-center justify-center text-white text-[18px] sticky top-0"
            style={fontBold}
          >
            Дії
          </div>
          {MOCK_ORDERS.map((item, index) => (
            <div
              key={item.id}
              className={`h-[40px] flex items-center justify-center ${
                index % 2 === 0 ? 'bg-[#e6e6e6]' : 'bg-[#f2f2f2]'
              }`}
            >
              {item.status === 'pending' ? (
                <button
                  onClick={() => onViewOrder(item.id)}
                  className="underline cursor-pointer bg-transparent border-none p-0 text-[16px]"
                  style={{ color: '#ff7b00', ...fontBold }}
                >
                  Підтвердити
                </button>
              ) : (
                <button
                  onClick={() => onViewOrder(item.id)}
                  className="underline cursor-pointer bg-transparent border-none p-0 text-[16px]"
                  style={{ color: '#5e89e8', ...fontRegular }}
                >
                  Переглянути
                </button>
              )}
            </div>
          ))}
          {Array.from({ length: EMPTY_ROWS_COUNT }).map((_, i) => (
            <div
              key={`empty-actions-${i}`}
              className={`h-[40px] ${
                (MOCK_ORDERS.length + i) % 2 === 0 ? 'bg-[#e6e6e6]' : 'bg-[#f2f2f2]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
