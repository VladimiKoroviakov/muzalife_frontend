import svgPaths from "./icons/svgIconPaths";
import { ProductCardProps } from "../../types";
import { IconBookmarks } from "../ui/icons/IconBookmarks";
import Badge from "../ui/badge";
import { toast } from "sonner";

function Delete({ onClick }: { onClick?: () => void }) {
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="flex p-[4px] justify-center items-center rounded-[8px] border border-[#4D4D4D] bg-[#E6E6E6] cursor-pointer hover:opacity-80 transition-opacity w-[40px] h-[42px]"
      data-name="delete"
    >
      <svg className="block" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="local_mall">
          <mask height="28" id="mask0_1_1724" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="28" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="28" id="Bounding box" width="28" />
          </mask>
          <g mask="url(#mask0_1_1724)">
            <path d={svgPaths.p3e6c88f0} fill="var(--fill-0, #4D4D4D)" id="local_mall_2" />
          </g>
        </g>
      </svg>
    </button>
  );
}

function Top({ image, showDelete, onDeleteClick }: { image: string; showDelete?: boolean; onDeleteClick?: () => void }) {
  return (
    <div className="h-[280px] opacity-90 relative shrink-0 w-full" data-name="top">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <img alt="" className="absolute max-w-none object-50%-50% object-cover size-full" src={image} />
        <div className="absolute bg-[rgba(0,0,0,0.1)] inset-0" />
      </div>
      {showDelete && (
        <div className="absolute" style={{ right: '12px', top: '12px' }}>
          <Delete onClick={onDeleteClick} />
        </div>
      )}
    </div>
  );
}

function Star() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="star">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <path d={svgPaths.p37caf400} fill="#E9CF0C" />
      </svg>
    </div>
  );
}

function Rating({ rating }: { rating: number }) {
  const displayRating = typeof rating === 'number' ? rating : 0;
  
  return (
    <div className="content-stretch flex gap-[4px] items-end justify-end relative shrink-0">
      <Star />
      <div className="flex flex-col justify-end leading-[0] not-italic relative shrink-0 text-[#4d4d4d] text-[16px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">{displayRating.toFixed(1)}</p>
      </div>
    </div>
  );
}

function Header({ 
  badgeText, 
  badgeColor, 
  rating, 
  showBookmark, 
  isBookmarked, 
  onBookmarkClick,
  isInCart
}: { 
  badgeText: string; 
  badgeColor?: string; 
  rating: number; 
  showBookmark?: boolean; 
  isBookmarked?: boolean; 
  onBookmarkClick?: () => void;
  isInCart?: boolean;
}) {
  // Disable bookmarking if product is in cart
  const canBookmark = !isInCart;
  
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!canBookmark) {
      toast.info('Товар вже в кошику. Неможливо додати до збережених.', {
        duration: 3000,
      });
      return;
    }
    onBookmarkClick?.();
  };
  
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <Badge text={badgeText} color={badgeColor} />
        <Rating rating={rating} />
        {showBookmark && (
          <div 
            onClick={handleBookmarkClick}
            className={`cursor-pointer transition-opacity ${
              canBookmark 
                ? 'hover:opacity-70' 
                : 'opacity-40 cursor-not-allowed'
            }`}
            data-name="icon bookmarks"
            title={isInCart ? "Товар вже в кошику. Неможливо додати до збережених." : ""}
          >
            <IconBookmarks isBookmarked={isBookmarked || false} />
          </div>
        )}
      </div>
  );
}

function Price({ price }: { price: number }) {
  return (
    <div className="basis-0 content-stretch flex gap-[10px] grow h-full items-center justify-center min-h-px min-w-px relative shrink-0" data-name="Price">
      <div className="flex flex-col font-['Atkinson_Hyperlegible:Bold','Noto_Sans:Bold',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[18px] text-center text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" }}>
        <p className="leading-[normal] whitespace-pre">{price} грн</p>
      </div>
    </div>
  );
}

function CartButton({ isInCart, onClick }: { isInCart?: boolean; onClick?: () => void }) {
  const text = isInCart ? "В кошику" : "До кошика";
  
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`bg-white box-border content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[12px] py-[12px] relative rounded-[12px] shrink-0 w-[134px] cursor-pointer hover:bg-[#f9f9f9] transition-all border border-[#4d4d4d] ${isInCart ? 'opacity-60' : 'opacity-100'}`}
      data-name="Button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <mask id="mask0_491_10357" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
          <rect width="20" height="20" fill="#D9D9D9"/>
        </mask>
        <g mask="url(#mask0_491_10357)">
          <path d="M4.5 18C4.0875 18 3.73437 17.8531 3.44062 17.5594C3.14687 17.2656 3 16.9125 3 16.5V6.5C3 6.0875 3.14687 5.73438 3.44062 5.44063C3.73437 5.14688 4.0875 5 4.5 5H6C6 3.89333 6.39049 2.95 7.17146 2.17C7.95229 1.39 8.89674 1 10.0048 1C11.1127 1 12.0556 1.39 12.8333 2.17C13.6111 2.95 14 3.89333 14 5H15.5C15.9125 5 16.2656 5.14688 16.5594 5.44063C16.8531 5.73438 17 6.0875 17 6.5V16.5C17 16.9125 16.8531 17.2656 16.5594 17.5594C16.2656 17.8531 15.9125 18 15.5 18H4.5ZM10.0048 12C11.1127 12 12.0556 11.61 12.8333 10.83C13.6111 10.05 14 9.10667 14 8H12.5C12.5 8.69444 12.2569 9.28472 11.7708 9.77083C11.2847 10.2569 10.6944 10.5 10 10.5C9.30556 10.5 8.71528 10.2569 8.22917 9.77083C7.74306 9.28472 7.5 8.69444 7.5 8H6C6 9.11111 6.39049 10.0556 7.17146 10.8333C7.95229 11.6111 8.89674 12 10.0048 12ZM7.5 5H12.5C12.5 4.30556 12.2569 3.71528 11.7708 3.22917C11.2847 2.74306 10.6944 2.5 10 2.5C9.30556 2.5 8.71528 2.74306 8.22917 3.22917C7.74306 3.71528 7.5 4.30556 7.5 5Z" fill="#0D0D0D"/>
        </g>
      </svg>
      <div className="flex flex-col font-['Atkinson_Hyperlegible:Regular','Noto_Sans:Regular',sans-serif] justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[16px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[normal] whitespace-pre">{text}</p>
      </div>
    </button>
  );
}

function Footer({ price, isInCart, onCartClick }: { price: number; isInCart?: boolean; onCartClick?: () => void }) {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Bottom">
      <Price price={price} />
      <CartButton isInCart={isInCart} onClick={onCartClick} />
    </div>
  );
}

export default function ProductCard({
  id,
  title,
  price,
  rating,
  image,
  badgeText,
  isInCart = false,
  isBookmarked = false,
  showBookmark = true,
  showDelete = false,
  onClick,
  onCartClick,
  onBookmarkClick,
  onDeleteClick
}: ProductCardProps) {
  return (
    <div 
      onClick={onClick}
      className="relative rounded-[16px] size-full cursor-pointer hover:opacity-90 transition-opacity" 
      data-name="Card"
    >
      <div className="content-stretch flex flex-col items-start min-w-inherit overflow-clip relative rounded-[inherit] size-full">
        {/* Top Image Area */}
        <Top image={image} showDelete={showDelete} onDeleteClick={onDeleteClick} />

        {/* Bottom Info Area */}
        <div 
          className="bg-[#f2f2f2] relative flex-1 w-full"
          onClick={(e) => {
            // Prevent card click when clicking on the bottom area (where cart button is)
            e.stopPropagation();
          }}
        >
          <div className="box-border content-stretch flex flex-col gap-[20px] items-start p-[12px] relative w-full h-full">
            {/* Header: Badge, Rating, Bookmark */}
            <Header 
              badgeText={badgeText}
              rating={rating}
              showBookmark={showBookmark}
              isBookmarked={isBookmarked}
              onBookmarkClick={onBookmarkClick}
              isInCart={isInCart} // Pass isInCart to Header
            />
            
            {/* Body: Title */}
            <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
              <p className="-webkit-box leading-[24px] h-[48px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#0d0d0d] text-[16px] w-full line-clamp-2" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400", display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {title}
              </p>
              
              {/* Footer: Price, Cart Button */}
              <Footer 
                price={price} 
                isInCart={isInCart} 
                onCartClick={onCartClick} 
              />
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#4d4d4d] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}