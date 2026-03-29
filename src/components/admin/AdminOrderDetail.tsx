import { iconPaths } from '../ui/icons/iconPaths';

interface AdminOrderDetailProps {
  orderId: string | null;
  onSectionChange: (section: string) => void;
}

const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };
const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };

interface MockOrder {
  id: string;
  title: string;
  status: 'processing' | 'pending' | 'developing' | 'rejected' | 'completed';
  type: string;
  audience: string;
  price: string;
  deadline: string;
  description: string;
}

const MOCK_ORDERS: Record<string, MockOrder> = {
  '1': {
    id: '1',
    title: 'Авторський квест «Подорож країнами світу». Для літнього табору.',
    status: 'processing',
    type: 'Квест',
    audience: 'Молодший шкільний вік',
    price: '500 грн',
    deadline: '03.11.2025',
    description: 'Квест для дітей 8-12 років, тематика — подорожі. Має включати 5-7 станцій з різними завданнями. Кожна станція — окрема країна з унікальними завданнями та цікавими фактами.',
  },
  '2': {
    id: '2',
    title: '1 Вересня – Побувайте на святі, що в новому форматі',
    status: 'pending',
    type: 'Сценарій',
    audience: 'Старший шкільний вік',
    price: '350 грн',
    deadline: '01.12.2025',
    description: 'Сценарій свята на 1 вересня для школи. Новий формат — інтерактивний, з залученням батьків. Потрібно включити музичні номери та конкурси.',
  },
  '3': {
    id: '3',
    title: 'Авторський квест «Подорож країнами світу». Для літнього табору.',
    status: 'developing',
    type: 'Квест',
    audience: 'Середній шкільний вік',
    price: '600 грн',
    deadline: '03.11.2025',
    description: 'Розширена версія квесту з додатковими матеріалами для вихователів. Включає методичні рекомендації та роздатковий матеріал.',
  },
  '4': {
    id: '4',
    title: 'День Вишиванки',
    status: 'rejected',
    type: 'Інше',
    audience: 'Дошкільний вік',
    price: '200 грн',
    deadline: '12.09.2025',
    description: 'Сценарій святкування Дня Вишиванки для дитячого садка. Включає розмальовки, пісні та танці.',
  },
  '5': {
    id: '5',
    title: 'День матері',
    status: 'completed',
    type: 'Поезія',
    audience: 'Молодший шкільний вік',
    price: '250 грн',
    deadline: '07.08.2025',
    description: 'Святковий сценарій до Дня матері з віршами та піснями. Підготовлені вірші для декламації та музичний супровід.',
  },
};

export function AdminOrderDetail({ orderId, onSectionChange }: AdminOrderDetailProps) {
  const order = orderId ? MOCK_ORDERS[orderId] : null;

  if (!order) {
    return (
      <div className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] p-[24px] flex items-center justify-center">
        <p className="text-[16px] text-[#4d4d4d]" style={fontRegular}>
          Замовлення не знайдено
        </p>
      </div>
    );
  }

  const isPending = order.status === 'pending';

  return (
    <div
      className="basis-0 grow min-h-px min-w-px bg-[#f2f2f2] rounded-[16px] p-[24px] flex flex-col gap-[20px]"
      data-name="AdminOrderDetail"
    >
      {/* Top: order name + badge */}
      <div className="flex items-center gap-[16px]">
        <h1
          className="text-[32px] text-[#0d0d0d] m-0 flex-1 min-w-0 truncate"
          style={fontBold}
        >
          {order.title}
        </h1>
        {isPending && (
          <div className="flex items-center gap-[8px] bg-[#ff7b00]/10 rounded-[12px] px-[16px] py-[8px] shrink-0">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d={iconPaths.screenRecord} fill="#ff7b00" />
            </svg>
            <span className="text-[14px] text-[#ff7b00] whitespace-nowrap" style={fontBold}>
              Очікує підтвердження
            </span>
          </div>
        )}
      </div>

      {/* Form fields row 1: Type + Audience */}
      <div className="flex gap-[24px]">
        <div className="flex-1">
          <label className="block text-[14px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>
            Тип
          </label>
          <div className="bg-[#f2f2f2] h-[52px] relative rounded-[12px]">
            <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
            <div className="flex items-center h-full px-[16px] text-[16px] text-[#0d0d0d]" style={fontRegular}>
              {order.type}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-[14px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>
            Аудиторія
          </label>
          <div className="bg-[#f2f2f2] h-[52px] relative rounded-[12px]">
            <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
            <div className="flex items-center h-full px-[16px] text-[16px] text-[#0d0d0d]" style={fontRegular}>
              {order.audience}
            </div>
          </div>
        </div>
      </div>

      {/* Form fields row 2: Price + Deadline */}
      <div className="flex gap-[24px]">
        <div className="flex-1">
          <label className="block text-[14px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>
            Ціна
          </label>
          <div className="bg-[#f2f2f2] h-[52px] relative rounded-[12px]">
            <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
            <div className="flex items-center justify-between h-full px-[16px]">
              <span className="text-[16px] text-[#0d0d0d]" style={fontRegular}>{order.price}</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d={iconPaths.editAdmin} fill="#4d4d4d" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-[14px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>
            Дедлайн
          </label>
          <div className="bg-[#f2f2f2] h-[52px] relative rounded-[12px]">
            <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
            <div className="flex items-center justify-between h-full px-[16px]">
              <span className="text-[16px] text-[#0d0d0d]" style={fontRegular}>{order.deadline}</span>
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                <path d={iconPaths.calendar} fill="#4d4d4d" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Description field */}
      <div className="flex-1 flex flex-col">
        <label className="block text-[14px] text-[#4d4d4d] mb-[6px]" style={fontRegular}>
          Опис замовлення
        </label>
        <div className="bg-[#f2f2f2] flex-1 relative rounded-[12px]">
          <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[12px]" />
          <p className="px-[16px] py-[12px] text-[16px] text-[#0d0d0d] m-0 leading-[24px] whitespace-pre-wrap" style={fontRegular}>
            {order.description}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-[16px] items-center justify-end shrink-0">
        <button
          onClick={() => onSectionChange('orders')}
          className="h-[44px] px-[24px] py-[12px] rounded-[12px] border-none bg-transparent cursor-pointer text-[16px] text-[#e53935] underline hover:opacity-80 transition-opacity"
          style={fontRegular}
        >
          Відхилити замовлення
        </button>
        <button
          onClick={() => onSectionChange('orders')}
          className="bg-[#5e89e8] h-[44px] px-[24px] py-[12px] rounded-[12px] border-none cursor-pointer text-[16px] text-white hover:opacity-90 transition-opacity"
          style={fontBold}
        >
          Підтвердити замовлення
        </button>
      </div>
    </div>
  );
}
