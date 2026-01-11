import { useState } from "react";
import { toast } from "sonner";
import svgPaths from "../ui/icons/svgIconPaths";
import { Table, TableColumn, TextCell, ActionCell, EmptyCell, TableCell } from "./TableComponents";

interface Order {
  name: string;
  date: string;
}

export function PurchaseHistoryContent() {
  const [showReviewScreen, setShowReviewScreen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());

  const orders: Order[] = [
    { name: "1 Вересня – Побувайте на святі, що в новому форматі", date: "01.12.2025" },
    { name: "Авторський квест «Подорож країнами світу». Для літнього табору.", date: "03.11.2025" },
    { name: "День Вишиванки", date: "12.09.2025" },
    { name: "День матері", date: "07.08.2025" },
  ];

  const getOrderKey = (name: string, date: string) => `${name}:${date}`;

  const handleResendMaterial = async (materialName: string, purchaseDate: string) => {
    try {
      toast.success(`Матеріал "${materialName}" буде відправлено на вашу email адресу`);
    } catch (error) {
      console.error('Error resending material:', error);
      toast.error('Помилка при відправці матеріалу');
    }
  };

  const handleOpenReview = (order: Order) => {
    const orderKey = getOrderKey(order.name, order.date);
    if (reviewedOrders.has(orderKey)) {
      toast.error('Ви вже залишили відгук', {
        description: 'Ви можете залишити лише один відгук на цей матеріал'
      });
      return;
    }
    
    setSelectedOrder(order);
    setShowReviewScreen(true);
  };

  const handleCloseReview = () => {
    setShowReviewScreen(false);
    setSelectedOrder(null);
  };

  const handleSubmitReview = async (rating: number, reviewText: string) => {
    try {
      console.log('Submitting review:', { rating, reviewText, material: selectedOrder?.name });
      toast.success('Відгук успішно надіслано!');
      
      if (selectedOrder) {
        const orderKey = getOrderKey(selectedOrder.name, selectedOrder.date);
        setReviewedOrders(prev => new Set(prev).add(orderKey));
      }
      
      handleCloseReview();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Помилка при відправці відгуку');
    }
  };

  // Generate table data
  const tableColumns = [
    {
      header: "Назва матеріалу",
      width: "60%",
      minWidth: "200px",
      cells: [
        ...orders.map((order, index) => (
          <TextCell 
            key={index}
            text={order.name}
            bg={index % 2 === 0 ? '#f2f2f2' : '#e6e6e6'}
          />
        )),
        ...Array.from({ length: 17 }, (_, index) => (
          <EmptyCell key={`empty-${index}`} bg={index % 2 === 0 ? '#f2f2f2' : '#e6e6e6'} />
        ))
      ]
    },
    {
      header: "Дата покупки",
      width: "20%",
      minWidth: "120px",
      cells: [
        ...orders.map((order, index) => (
          <TextCell 
            key={index}
            text={order.date}
            bg={index % 2 === 0 ? '#f2f2f2' : '#e6e6e6'}
            color="#4d4d4d"
          />
        )),
        ...Array.from({ length: 17 }, (_, index) => (
          <EmptyCell key={`empty-${index}`} bg={index % 2 === 0 ? '#f2f2f2' : '#e6e6e6'} />
        ))
      ]
    },
    {
      header: "Дії",
      width: "20%",
      minWidth: "100px",
      cells: [
        ...orders.map((order, index) => (
          <TableCell key={index} bg={index % 2 === 0 ? '#f2f2f2' : '#e6e6e6'}>
            <div className="flex flex-row items-center size-full">
              <div className="box-border content-stretch flex gap-[16px] h-[40px] items-center px-[16px] py-[10px] relative w-full">
                <div 
                  onClick={() => handleResendMaterial(order.name, order.date)}
                  className="relative shrink-0 size-[24px] cursor-pointer hover:opacity-70 transition-opacity" 
                  data-name="icon download"
                >
                  <div className="absolute inset-[16.667%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-4px] mask-size-[24px_24px]" data-name="download">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                      <path d={svgPaths.p13494900} fill="var(--fill-0, #0D0D0D)" id="download" />
                    </svg>
                  </div>
                </div>
                <div 
                  onClick={() => handleOpenReview(order)}
                  className={`relative shrink-0 size-[24px] transition-opacity ${
                    reviewedOrders.has(getOrderKey(order.name, order.date))
                      ? 'opacity-30 cursor-not-allowed'
                      : 'cursor-pointer hover:opacity-70'
                  }`}
                  data-name="comment"
                >
                  <div className="absolute inset-[8.333%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2px] mask-size-[24px_24px]" data-name="comment">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                      <path d={svgPaths.p159e6480} fill="var(--fill-0, #4D4D4D)" id="comment" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </TableCell>
        )),
        ...Array.from({ length: 17 }, (_, index) => (
          <EmptyCell key={`empty-${index}`} bg={index % 2 === 0 ? '#f2f2f2' : '#e6e6e6'} />
        ))
      ]
    }
  ];

  return (
    <div className="basis-0 content-stretch flex flex-col gap-[10px] grow h-full items-start min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right Side">
      <div className="bg-[#f2f2f2] box-border content-stretch flex gap-[12px] grow h-full w-full items-start overflow-clip px-[24px] relative rounded-[16px] shrink-0 px-[20px] py-[16px]" data-name="Scrolling Table">
        <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden w-full" data-name="Table">
          <div className="content-stretch flex gap-[2px] items-start overflow-x-clip overflow-y-auto relative size-full rounded-[12px] w-full">
            <Table columns={tableColumns} />
          </div>
          <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[12px]" />
        </div>
      </div>
    </div>
  );
}