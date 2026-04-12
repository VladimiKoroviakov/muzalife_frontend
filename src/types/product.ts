/**
 * @fileoverview Product, review, and product-related component prop types.
 * @module types/product
 */

export type Product = {
  id: number;
  title: string;
  price: number;
  rating: number;
  type: 'Сценарій' | 'Квест' | 'Поезія' | 'Безкоштовний матеріал' | 'Інше';
  image: string;
  ageCategory: string[];
  events: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
  additionalImages: string[];
  additionalImageIds: number[];
};

export type ProductCardProps = {
  id: number;
  title: string;
  price: number;
  rating: number;
  image: string;
  badgeText: string;
  badgeColor?: string;
  isInCart?: boolean;
  isBookmarked?: boolean;
  showBookmark?: boolean;
  showDelete?: boolean;

  // Event Handlers
  onClick?: () => void;
  onCartClick?: () => void;
  onBookmarkClick?: () => void;
  onDeleteClick?: () => void;
};

export interface SavedScenariosContentProps {
  onBack: () => void;
  addToCart?: (productId: number) => void;
  products?: Product[];
  onBookmarkedProductsChange?: (products: number[]) => void;
}

export interface BoughtProduct {
  id: number;
  title: string;
  type: string;
  boughtAt: string;
  hidden: boolean;
}

export interface BoughtScenariosContentProps {
  onBack: () => void;
}

export interface Order {
  id: number;
  name: string;
  date: string;
  orderDate?: string;
  formattedDate?: string;
  materialType?: string;
  hidden?: boolean;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UseSingleProduct {
  product: Product | null;
  reviews: Review[];
  galleryImages: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  /** FK → ProductTypes.product_type_id */
  typeId: number;
  /** FK → AgeCategories.age_category_id (one or more) */
  ageCategoryIds?: number[];
  /** FK → Events.event_id (one or more) */
  eventIds?: number[];
  hidden?: boolean;
}

export interface UpdateProductData {
  title?: string;
  description?: string;
  price?: number;
  typeId?: number;
  ageCategoryIds?: number[];
  eventIds?: number[];
}

export interface ProductFile {
  fileId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

export interface ProductAnalytics {
  productId: number;
  /** ISO 8601 start of the measured window. */
  timeFrom: string;
  /** ISO 8601 end of the measured window. */
  timeTo: string;
  views: number;
  purchases: number;
  saves: number;
  /** Average review rating in the window (0 when no reviews). */
  averageRating: number;
  reviewCount: number;
  /** Revenue = purchases × product_price in the window. */
  revenue: number;
}

/** Lightweight product record for the admin analytics product selector. */
export interface AnalyticsProduct {
  id: number;
  title: string;
  /** Whether the product is soft-deleted (hidden). */
  hidden: boolean;
}

export interface AdminProductApiResponse {
  success: boolean;
  product?: Product;
  error?: string;
}

/** A product type record as returned by `GET /api/products/types`. */
export interface ProductTypeLookup {
  id: number;
  name: string;
}

/** An age category record as returned by `GET /api/products/age-categories`. */
export interface AgeCategoryLookup {
  id: number;
  name: string;
}

/** An event record as returned by `GET /api/products/events`. */
export interface EventLookup {
  id: number;
  name: string;
}
