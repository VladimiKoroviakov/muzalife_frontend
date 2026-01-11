import { Product, Review } from "../../types";
import { ProductTags } from "./ProductTags";
import { ProductTabs } from "./ProductTabs";
import { ProductActions } from "./ProductActions";

interface ProductInfoProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  product: Product;
  reviews: Review[];
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isInCart: boolean;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
  canBookmark: boolean;
}

export function ProductInfo({ 
  activeTab, 
  setActiveTab, 
  product, 
  reviews, 
  isBookmarked, 
  onToggleBookmark,
  isInCart,
  onAddToCart,
  onRemoveFromCart,
  canBookmark
}: ProductInfoProps) {
  return (
    <div className="basis-0 grow h-full min-h-px min-w-px relative rounded-[16px] shrink-0" data-name="Right side">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[28px] items-start px-[24px] py-[16px] relative size-full">
          <div className="-webkit-box flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] overflow-ellipsis overflow-hidden relative shrink-0 text-[#0d0d0d] text-[32px] w-full" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
            <p className="leading-[40px]">{product.title}</p>
          </div>
          
          <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0 w-full" data-name="Main">
            <ProductTags product={product} />
            <ProductTabs activeTab={activeTab} setActiveTab={setActiveTab} product={product} reviews={reviews} />
          </div>
          
          <ProductActions 
            product={product} 
            isBookmarked={isBookmarked}
            onToggleBookmark={onToggleBookmark}
            isInCart={isInCart}
            onAddToCart={onAddToCart}
            onRemoveFromCart={onRemoveFromCart}
            canBookmark={canBookmark}
          />
        </div>
      </div>
    </div>
  );
}