import { useState, useEffect, useCallback } from "react";
import svgPaths from "../ui/icons/svgIconPaths";
import { Table, TableColumn, TextCell, ActionCell, EmptyCell } from "./TableComponents";


// Sample data
const ordersData = [
  { name: "Авторський квест «Подорож країнами світу». Для літнього табору.", status: "В обробці", date: "03.11.2025", price: "850 грн", action: "Переглянути" },
  { name: "1 Вересня – Побувайте на святі, що в новому форматі", status: "Не підтверджено", date: "01.12.2025", price: "1000 грн", action: "Підтвердити", actionColor: "#ff7b00", boldAction: true },
  { name: "Авторський квест «Подорож країнами світу». Для літнього табору.", status: "Розробляється", date: "03.11.2025", price: "850 грн", action: "Переглянути" },
  { name: "День Вишиванки", status: "Відхилено", date: "12.09.2025", price: "-", action: "Переглянути" },
  { name: "День матері", status: "Виконано", date: "07.08.2025", price: "500 грн", action: "Переглянути" },
];

export function PersonalOrdersContent() {
  const [columnWidths, setColumnWidths] = useState([400, 180, 180, 140, 160]);
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = (e: React.MouseEvent, columnIndex: number) => {
    e.preventDefault();
    setResizingColumn(columnIndex);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnIndex]);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (resizingColumn !== null) {
      const diff = e.clientX - startX;
      const newWidth = Math.max(100, startWidth + diff);
      const newWidths = [...columnWidths];
      newWidths[resizingColumn] = newWidth;
      setColumnWidths(newWidths);
    }
  }, [resizingColumn, startX, startWidth, columnWidths]);

  const handleMouseUp = useCallback(() => {
    setResizingColumn(null);
  }, []);

  useEffect(() => {
    if (resizingColumn !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingColumn, handleMouseMove, handleMouseUp]);

  // Generate table data dynamically
  const generateTableData = () => {
    const emptyRows = 17;
    
    return [
      {
        header: "Назва Замовлення",
        width: columnWidths[0],
        minWidth: "200px",
        cells: [
          ...ordersData.map((order, index) => (
            <TextCell 
              key={`name-${index}`}
              text={order.name}
              bg={index % 2 === 0 ? '#e6e6e6' : '#f2f2f2'}
            />
          )),
          ...Array.from({ length: emptyRows }, (_, index) => (
            <EmptyCell 
              key={`empty-name-${index}`} 
              bg={(index + ordersData.length) % 2 === 0 ? '#f2f2f2' : '#e6e6e6'} 
            />
          ))
        ]
      },
      {
        header: "Статус",
        width: columnWidths[1],
        minWidth: "120px",
        cells: [
          ...ordersData.map((order, index) => (
            <TextCell 
              key={`status-${index}`}
              text={order.status}
              bg={index % 2 === 0 ? '#e6e6e6' : '#f2f2f2'}
              bold={order.boldAction}
              color={order.actionColor}
            />
          )),
          ...Array.from({ length: emptyRows }, (_, index) => (
            <EmptyCell 
              key={`empty-status-${index}`} 
              bg={(index + ordersData.length) % 2 === 0 ? '#f2f2f2' : '#e6e6e6'} 
            />
          ))
        ]
      },
      {
        header: "Дата Замовлення",
        width: columnWidths[2],
        minWidth: "190px",
        cells: [
          ...ordersData.map((order, index) => (
            <TextCell 
              key={`date-${index}`}
              text={order.date}
              bg={index % 2 === 0 ? '#e6e6e6' : '#f2f2f2'}
            />
          )),
          ...Array.from({ length: emptyRows }, (_, index) => (
            <EmptyCell 
              key={`empty-date-${index}`} 
              bg={(index + ordersData.length) % 2 === 0 ? '#f2f2f2' : '#e6e6e6'} 
            />
          ))
        ]
      },
      {
        header: "Ціна",
        width: columnWidths[3],
        minWidth: "100px",
        cells: [
          ...ordersData.map((order, index) => (
            <TextCell 
              key={`price-${index}`}
              text={order.price}
              bg={index % 2 === 0 ? '#e6e6e6' : '#f2f2f2'}
              centered={order.price === "-"}
            />
          )),
          ...Array.from({ length: emptyRows }, (_, index) => (
            <EmptyCell 
              key={`empty-price-${index}`} 
              bg={(index + ordersData.length) % 2 === 0 ? '#f2f2f2' : '#e6e6e6'} 
            />
          ))
        ]
      },
      {
        header: "Дії",
        width: columnWidths[4],
        minWidth: "120px",
        cells: [
          ...ordersData.map((order, index) => (
            <ActionCell 
              key={`action-${index}`}
              text={order.action}
              bg={index % 2 === 0 ? '#e6e6e6' : '#f2f2f2'}
              bold={order.boldAction}
              color={order.actionColor}
              onClick={() => console.log(`Action clicked: ${order.action} for ${order.name}`)}
            />
          )),
          ...Array.from({ length: emptyRows }, (_, index) => (
            <EmptyCell 
              key={`empty-action-${index}`} 
              bg={(index + ordersData.length) % 2 === 0 ? '#f2f2f2' : '#e6e6e6'} 
            />
          ))
        ]
      }
    ];
  };

  return (
    <div className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[20px] items-start relative size-full overflow-hidden px-[24px] px-[20px] py-[16px]">
          {/* Scrolling Table */}
          <div className="basis-0 bg-[#f2f2f2] content-stretch flex gap-[8px] grow items-start min-h-px min-w-px overflow-clip relative shrink-0 w-full" data-name="Scrolling Table">
            {/* Table */}
            <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-auto" data-name="Table">
              <Table 
                columns={generateTableData()} 
                onColumnResize={(columnIndex, newWidth) => {
                  // Handle column resize if needed
                  console.log(`Resize column ${columnIndex} to ${newWidth}`);
                }}
              />
              <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
            </div>
          </div>
          
          {/* Bottom Row */}
          <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0 w-full" data-name="row">
            <p className="[text-underline-position:from-font] [white-space-collapse:collapse] basis-0 decoration-solid font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] grow leading-[normal] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap underline cursor-pointer hover:text-[#5e89e8] transition-colors" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
              Умови та Політика Використання
            </p>
            <div className="bg-white box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 cursor-pointer hover:bg-[#f2f2f2] transition-colors" data-name="Button">
              <div aria-hidden="true" className="absolute border border-[#4d4d4d] border-solid inset-0 pointer-events-none rounded-[12px]" />
              <div className="relative shrink-0 size-[20px]" data-name="icon order">
                <div className="absolute inset-[8.33%_4.17%_8.33%_12.5%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px_-2px] mask-size-[24px_24px]" data-name="contract_edit">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
                    <path d={svgPaths.p7a22000} fill="var(--fill-0, #0D0D0D)" id="contract_edit" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                <p className="leading-[normal] whitespace-pre">Зробити нове замовлення</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}