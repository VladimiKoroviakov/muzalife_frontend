import { MiddleBar } from "./MiddleBar";
import { Product } from "../../types";
import { FiltersSidebar } from "../features/FiltersSidebar";
import ProductCard from "../ui/ProductCard";

interface CanvasProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedAgeCategory: string | null;
  setSelectedAgeCategory: (category: string | null) => void;
  selectedEvents: string[];
  toggleEvent: (event: string) => void;
  clearFilters: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  products: Product[];
  bookmarkedProducts: number[];
  toggleBookmark: (id: number) => void;
  addToCart: (id: number) => void;
  onCardClick: (id: number) => void;
  cartItems: number[];
}

export function Canvas({
  showFilters,
  setShowFilters,
  selectedAgeCategory,
  setSelectedAgeCategory,
  selectedEvents,    
  toggleEvent,
  clearFilters,
  activeTab,
  setActiveTab,
  products,
  bookmarkedProducts,
  toggleBookmark,
  addToCart,
  onCardClick,
  cartItems
}: CanvasProps) {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start max-w-[1280px] min-h-px min-w-px relative shrink-0 w-[1280px]" data-name="Canvas">
      <MiddleBar 
        showFilters={showFilters} 
        setShowFilters={setShowFilters} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <div className="basis-0 content-stretch flex gap-[24px] grow items-start min-h-px min-w-px relative shrink-0 w-full">
        {showFilters && (
          <div className="box-border content-stretch flex gap-[10px] h-full items-center px-0 py-[24px] relative shrink-0">
            <FiltersSidebar
              selectedAgeCategory={selectedAgeCategory}
              setSelectedAgeCategory={setSelectedAgeCategory}
              selectedEvents={selectedEvents}
              toggleEvent={toggleEvent}
              clearFilters={clearFilters}
            />
          </div>
        )}

        <div className={`box-border content-stretch flex gap-[10px] h-full items-start pb-0 pt-[24px] px-0 relative shrink-0 ${showFilters ? "basis-0 grow min-h-px min-w-px" : "w-[1280px]"}`}>
          <div className={`content-start grid ${showFilters ? "grid-cols-3" : "grid-cols-4"} gap-[24px] h-full items-stretch overflow-x-clip overflow-y-auto relative ${showFilters ? "rounded-tl-[12px] rounded-tr-[12px]" : "rounded-tl-[16px] rounded-tr-[16px]"} shrink-0 ${showFilters ? "basis-0 grow min-h-px min-w-px" : "basis-0 grow min-h-px min-w-px"}`}>
            {products.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-full self-stretch text-[#4d4d4d]">
                <p className="text-[18px] text-center">
                  Матеріалів не знайдено
                </p>
              </div>
            ) : (
              products.map((product) => {
                const isBookmarked = bookmarkedProducts.includes(product.id);

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    rating={product.rating}
                    image={product.image}
                    badgeText={product.type}
                    isBookmarked={isBookmarked}
                    showBookmark={true}
                    isInCart={cartItems.includes(product.id)}
                    onClick={() => onCardClick(product.id)}
                    onBookmarkClick={() => toggleBookmark(product.id)}
                    onCartClick={() => addToCart(product.id)}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}