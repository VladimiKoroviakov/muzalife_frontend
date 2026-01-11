import { Product } from "../../types";
import { CartItem } from '../ui/CartItem';
import { IconBag } from "../ui/icons/IconBag";
import CloseButton from "../ui/CloseButton";

// Cart Component
export function Cart({ cartItems, products, onClose, onRemoveItem }: { cartItems: number[]; products: Product[]; onClose: () => void; onRemoveItem: (id: number) => void }) {
  const cartProducts = products.filter(p => cartItems.includes(p.id));
  const totalPrice = cartProducts.reduce((sum, product) => sum + product.price, 0);

  return (
    <>
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-[10px] backdrop-filter bg-[rgba(0,0,0,0.4)] z-40" onClick={onClose} data-name="Blur layer" />
      
      {/* Cart panel */}
      <div className="absolute bg-[#e6e6e6] box-border content-stretch flex gap-[10px] h-[876px] items-center right-0 top-0 p-[24px] rounded-bl-[16px] rounded-tl-[16px] w-[480px] z-50" data-name="Cart">
        <div className="basis-0 content-stretch flex flex-col gap-[24px] grow h-full items-start max-w-[1280px] min-h-px min-w-px relative rounded-[24px] shrink-0" data-name="Canvas">
          {/* Title */}
          <div className="content-stretch flex h-[52px] items-center justify-center relative rounded-[12px] shrink-0 w-full" data-name="Title">
            <div className="basis-0 content-stretch flex gap-[8px] grow h-full items-center justify-center min-h-px min-w-px relative shrink-0">
              <IconBag />
              <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[28px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
                <p className="leading-[normal] whitespace-pre">Кошик</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute box-border content-stretch flex gap-[20px] items-center justify-center left-0 px-[16px] py-[12px] rounded-[12px] size-[52px] top-0 cursor-pointer hover:opacity-70 transition-opacity"
              data-name="Close"
            >
              <CloseButton />
            </button>
          </div>

          {/* Scrolling Content */}
          <div className="basis-0 content-stretch flex gap-[12px] grow items-center min-h-px min-w-px relative rounded-[12px] shrink-0 w-full" data-name="Scrolling">
            {cartProducts.length === 0 ? (
              <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal w-full justify-end leading-[0] relative shrink-0 text-[18px] text-black text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
                <p className="leading-[normal] whitespace-pre text-center">Ваш кошик пустий</p>
              </div>
            ) : (
              <div className="basis-0 content-stretch flex flex-col gap-[16px] grow h-full items-start min-h-px min-w-px overflow-x-clip overflow-y-auto relative rounded-tl-[12px] rounded-tr-[12px] shrink-0" data-name="Products">
                
                {cartProducts.map((product) => (
                  <CartItem
                    key={product.id}
                    product={product}
                    onRemoveItem={onRemoveItem}
                  />
                ))}
                
              </div>
            )}
          </div>

          {/* Order Button */}
          {cartProducts.length > 0 && (
            <button className="bg-[#5e89e8] h-[44px] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:opacity-90 transition-opacity" data-name="Button">
              <div aria-hidden="true" className="absolute border border-[#5e89e8] border-solid inset-0 pointer-events-none rounded-[12px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <div className="box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative w-full">
                  <IconBag />
                  <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] justify-end leading-[0] relative shrink-0 text-[16px] text-nowrap text-white" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
                    <p className="leading-[normal] whitespace-pre">Замовити {totalPrice} грн</p>
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </>
  );
}