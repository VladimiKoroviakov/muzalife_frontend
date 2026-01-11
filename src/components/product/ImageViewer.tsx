import { Product } from "../../types";
import svgIconPaths from "../ui/icons/svgIconPaths";

function CloseViewer() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="close">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <path d={svgIconPaths.p2e879500} fill="var(--fill-0, #F2F2F2)" />
      </svg>
    </div>
  );
}

function KeyboardArrowLeftViewer({ onClick }: { onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="absolute h-[76px] left-[24px] top-1/2 -translate-y-1/2 w-[31.4px] cursor-pointer hover:opacity-80 transition-opacity z-10" 
      data-name="keyboard_arrow_left"
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 76">
        <path d={svgIconPaths.p2a8cf580} fill="var(--fill-0, #E6E6E6)" />
        <path d={svgIconPaths.p3c24ee00} fill="var(--fill-0, #4D4D4D)" />
      </svg>
    </div>
  );
}

function KeyboardArrowRightViewer({ onClick }: { onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="absolute h-[76px] right-[24px] top-1/2 -translate-y-1/2 w-[31.4px] cursor-pointer hover:opacity-80 transition-opacity z-10" 
      data-name="keyboard_arrow_right"
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 76">
        <path d={svgIconPaths.p38d93c30} fill="var(--fill-0, #F2F2F2)" />
        <path d={svgIconPaths.p33a95500} fill="var(--fill-0, #0D0D0D)" />
      </svg>
    </div>
  );
}

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  galleryImages: string[];
  product: Product;
}

export function ImageViewer({ 
  isOpen, 
  onClose, 
  currentImageIndex, 
  onNext, 
  onPrevious,
  galleryImages,
  product
}: ImageViewerProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute backdrop-blur-[10px] backdrop-filter bg-[rgba(0,0,0,0.4)] inset-0" onClick={onClose} data-name="Blur layer" />
      
      <div className="relative w-full h-full flex items-center justify-center px-[146px] py-[116px]">
        <div className="relative h-[700px] w-[1157px]" data-name="Image">
          <img 
            alt={`${product.title} - Image ${currentImageIndex + 1}`}
            className="absolute inset-0 max-w-none object-50%-50% object-contain size-full" 
            src={galleryImages[currentImageIndex]} 
          />
        </div>

        <div 
          onClick={onClose}
          className="absolute box-border content-stretch flex gap-[20px] items-center justify-center right-[48px] px-[20px] py-[12px] rounded-[16px] top-[24px] cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition-colors" 
          data-name="Close"
        >
          <div aria-hidden="true" className="absolute border border-[#f2f2f2] border-solid inset-0 pointer-events-none rounded-[16px]" />
          <CloseViewer />
        </div>

        {galleryImages.length > 1 && (
          <>
            <KeyboardArrowLeftViewer onClick={onPrevious} />
            <KeyboardArrowRightViewer onClick={onNext} />
          </>
        )}
      </div>
    </div>
  );
}