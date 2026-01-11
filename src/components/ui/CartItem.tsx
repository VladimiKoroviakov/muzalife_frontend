import { Product } from "../../types";
import { IconTrash } from "../ui/icons/IconTrash";

function Delete({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className="relative shrink-0 size-[28px] cursor-pointer hover:opacity-70 transition-opacity flex items-center justify-center" 
      data-name="delete"
    >
      <IconTrash className="size-[20px] text-[#4D4D4D]" />
    </button>
  );
}

interface CartItemProps {
  product: Product;
  onRemoveItem: (id: number) => void;
}

export function CartItem({ product, onRemoveItem }: CartItemProps) {
  return (
    <div className="bg-[#f2f2f2] box-border content-stretch flex gap-[12px] h-[104px] items-center overflow-clip pl-[4px] pr-[16px] py-[4px] relative rounded-[16px] shrink-0 w-full" data-name="Product card">
      {/* Product Info */}
      <div className="content-stretch flex gap-[12px] h-full items-center overflow-clip relative shrink-0 w-[348px]" data-name="Scenario">
        {/* Image */}
        <div className="aspect-[2048/1911] h-full relative rounded-[12px] shrink-0" data-name="product-image">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[12px]">
            <img alt={product.title} className="absolute max-w-none object-50%-50% object-cover rounded-[12px] size-full" src={product.image} />
            <div className="absolute bg-[rgba(0,0,0,0.1)] inset-0 rounded-[12px]" />
          </div>
        </div>

        {/* Title & Price */}
        <div className="basis-0 box-border content-stretch flex flex-col gap-[16px] grow h-full items-start min-h-px min-w-px px-0 py-[8px] relative shrink-0" data-name="Title">
          <p className="-webkit-box font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] leading-[normal] min-w-full overflow-ellipsis overflow-hidden relative shrink-0 text-[16px] text-black w-[min-content]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400", WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', display: '-webkit-box' }}>
            {product.title}
          </p>
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="bottom">
            <p className="font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] leading-[normal] overflow-ellipsis overflow-hidden relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
              {product.price} грн
            </p>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <Delete onClick={() => onRemoveItem(product.id)} />
    </div>
  );
}