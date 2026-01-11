import { Product } from "../../types";
import svgIconPaths from "../ui/icons/svgIconPaths";

function KeyboardArrowLeft({ onClick }: { onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-bl-[4px] rounded-tl-[4px] shrink-0 cursor-pointer hover:bg-[#dadada] transition-colors" 
      data-name="keyboard_arrow_left"
    >
      <div aria-hidden="true" className="absolute border border-[#f2f2f2] border-solid inset-0 pointer-events-none rounded-bl-[4px] rounded-tl-[4px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-[8px] py-[6px] relative size-full">
          <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="keyboard_arrow_left">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 12">
              <path d={svgIconPaths.p1cc3a100} fill="var(--fill-0, #4D4D4D)" id="keyboard_arrow_left" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function KeyboardArrowRight({ onClick }: { onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="basis-0 bg-[#f2f2f2] grow h-full min-h-px min-w-px relative rounded-br-[4px] rounded-tr-[4px] shrink-0 cursor-pointer hover:bg-[#e6e6e6] transition-colors" 
      data-name="keyboard_arrow_right"
    >
      <div className="border border-[#f2f2f2] flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[10px] items-center justify-center px-[8px] py-[6px] relative size-full">
          <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="keyboard_arrow_right">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 12">
              <path d={svgIconPaths.p33166380} fill="var(--fill-0, #0D0D0D)" id="keyboard_arrow_right" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({ 
  sliderIndex, 
  onPrevious, 
  onNext, 
  onThumbnailClick,
  galleryImages,
  product
}: { 
  sliderIndex: number; 
  onPrevious: () => void; 
  onNext: () => void;
  onThumbnailClick: (index: number) => void;
  galleryImages: string[];
  product: Product;
}) {
  const visibleImages = [];
  const visibleIndices: number[] = [];
  
  for (let i = 0; i < Math.min(5, galleryImages.length); i++) {
    const index = (sliderIndex + i) % galleryImages.length;
    visibleImages.push(galleryImages[index]);
    visibleIndices.push(index);
  }

  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 w-full" data-name="Slider">
      <div className="basis-0 flex flex-row grow items-center self-stretch shrink-0">
        <KeyboardArrowLeft onClick={onPrevious} />
      </div>
      
      {visibleImages.map((image, position) => (
        <div 
          key={visibleIndices[position]}
          onClick={() => onThumbnailClick(visibleIndices[position])}
          className={`h-[95px] relative rounded-[4px] shrink-0 cursor-pointer hover:opacity-80 transition-opacity ${
            position === 0 ? 'w-[137px]' : 'w-[65px]'
          }`} 
          data-name="Image"
        >
          <div aria-hidden="true" className="absolute inset-0 rounded-[4px]">
            <img 
              alt={`${product.title} - Image ${visibleIndices[position] + 1}`}
              className={`absolute max-w-none object-50%-50% rounded-[4px] size-full ${
                position === 0 ? 'object-contain' : 'object-cover'
              }`} 
              src={image} 
            />
            <div className="absolute bg-[rgba(0,0,0,0.1)] inset-0 rounded-[4px]" />
          </div>
          {position === 0 && (
            <div aria-hidden="true" className="absolute border border-[#5e89e8] border-solid inset-[-1px] rounded-[5px]" />
          )}
        </div>
      ))}
      
      <div className="basis-0 flex flex-row grow items-center self-stretch shrink-0">
        <KeyboardArrowRight onClick={onNext} />
      </div>
    </div>
  );
}

interface ProductGalleryProps {
  onImageClick: () => void;
  sliderIndex: number;
  onSliderPrevious: () => void;
  onSliderNext: () => void;
  currentMainImage: string;
  onThumbnailClick: (index: number) => void;
  galleryImages: string[];
  product: Product;
}

export function ProductGallery({ 
  onImageClick, 
  sliderIndex, 
  onSliderPrevious, 
  onSliderNext,
  currentMainImage,
  onThumbnailClick,
  galleryImages,
  product
}: ProductGalleryProps) {
  if (!product || galleryImages.length === 0) {
    return (
      <div className="content-stretch flex flex-col gap-[16px] h-full items-start relative shrink-0" data-name="Left side">
        <div className="basis-0 grow min-h-px min-w-px relative rounded-[16.483px] shrink-0 w-[575px] bg-gray-200 flex items-center justify-center">
          <div className="text-[#4d4d4d]">No image available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-stretch flex flex-col gap-[16px] h-full items-start relative shrink-0" data-name="Left side">
      <div 
        onClick={onImageClick}
        className="basis-0 grow min-h-px min-w-px relative rounded-[16.483px] shrink-0 w-[575px] cursor-pointer hover:opacity-90 transition-opacity" 
        data-name="Image"
      >
        <div aria-hidden="true" className="absolute inset-0 rounded-[16.483px]">
          <img 
            alt={product.title} 
            className="absolute max-w-none object-50%-50% object-contain rounded-[16.483px] size-full" 
            src={currentMainImage} 
          />
          <div className="absolute bg-[rgba(0,0,0,0.1)] inset-0 rounded-[16.483px]" />
        </div>
      </div>
      
      {galleryImages.length > 1 && (
        <Slider 
          sliderIndex={sliderIndex}
          onPrevious={onSliderPrevious}
          onNext={onSliderNext}
          onThumbnailClick={onThumbnailClick}
          galleryImages={galleryImages}
          product={product}
        />
      )}
    </div>
  );
}