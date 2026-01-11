import svgIconPaths from "../ui/icons/svgIconPaths";
import { Product } from "../../types";

interface SaveButtonProps {
  isBookmarked: boolean;
  onClick: () => void;
  canBookmark: boolean;
}

function SaveButton({ isBookmarked, onClick, canBookmark }: SaveButtonProps) {
  const handleClick = () => {
    if (canBookmark) {
      onClick();
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 transition-colors ${
        canBookmark 
          ? 'bg-white hover:bg-gray-50 cursor-pointer' 
          : 'bg-gray-200 cursor-not-allowed opacity-60'
      }`} 
      data-name="Button"
      disabled={!canBookmark}
      title={!canBookmark ? "Товар в кошику. Неможливо додати до збережених." : ""}
    >
      <div className="relative shrink-0 size-[20px]" data-name="icon bookmarks">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <path 
            d={svgIconPaths.p2a584480} 
            fill={isBookmarked ? "#5e89e8" : "var(--fill-0, #0D0D0D)"} 
          />
        </svg>
      </div>
      <div className={`flex flex-col justify-end leading-[0] relative shrink-0 text-[16px] text-nowrap ${
        canBookmark ? "text-[#0d0d0d]" : "text-gray-500"
      }`} style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[normal] whitespace-pre">
          {isBookmarked ? "Збережено" : "Зберегти"}
        </p>
      </div>
    </button>
  );
}

interface BuyButtonProps {
  isInCart: boolean;
  onClick: () => void;
  onRemoveClick: () => void;
}

function BuyButton({ isInCart, onClick, onRemoveClick }: BuyButtonProps) {
  const handleClick = () => {
    if (isInCart) {
      onRemoveClick();
    } else {
      onClick();
    }
  };

  const text = isInCart ? "В кошику" : "До Кошика";

  return (
    <button
      onClick={handleClick}
      className={`box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[24px] py-[12px] relative rounded-[12px] shrink-0 cursor-pointer transition-all border ${
        isInCart 
          ? 'bg-[#f0f4ff] border-[#4a76d6] hover:bg-[#e6eeff] text-[#0d0d0d]' 
          : 'bg-[#5e89e8] border-transparent hover:bg-[#4a76d6] text-white'
      }`}
      data-name="Button"
    >
      <div className="relative shrink-0 size-[20px]" data-name="icon bag">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <path 
            d={svgIconPaths.p2fd02b00} 
            fill={isInCart ? "#0D0D0D" : "var(--fill-0, white)"} 
          />
        </svg>
      </div>
      <div className={`flex flex-col justify-end leading-[0] relative shrink-0 text-[16px] text-nowrap ${
        isInCart ? "text-[#0d0d0d]" : "text-white"
      }`} style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[normal] whitespace-pre">{text}</p>
      </div>
    </button>
  );
}

interface ProductActionsProps {
  product: Product;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isInCart: boolean;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
  canBookmark: boolean;
}

export function ProductActions({ 
  product, 
  isBookmarked, 
  onToggleBookmark,
  isInCart,
  onAddToCart,
  onRemoveFromCart,
  canBookmark
}: ProductActionsProps) {
  return (
    <div className="bg-[#e6e6e6] content-stretch flex gap-[20px] items-end justify-end relative shrink-0 w-full" data-name="Bottom section">
      <div className="basis-0 flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] grow h-full justify-center leading-[0] min-h-px min-w-px relative shrink-0 text-[#0d0d0d] text-[28px] text-center" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
        <p className="leading-[normal]">{product.price} грн</p>
      </div>
      <SaveButton 
        isBookmarked={isBookmarked} 
        onClick={onToggleBookmark}
        canBookmark={canBookmark}
      />
      <BuyButton 
        isInCart={isInCart} 
        onClick={onAddToCart}
        onRemoveClick={onRemoveFromCart}
      />
    </div>
  );
}