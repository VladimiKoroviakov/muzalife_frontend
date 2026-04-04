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
  ageCategory: string;
  events: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
  additionalImages: string[];
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

export interface BoughtScenariosContentProps {
  onBack: () => void;
  // TODO: narrow to Product[] once PurchaseHistoryContent stops accessing
  // non-Product fields (bought_at, orderDate) on items.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products?: any[];
}

export interface Order {
  id: number;
  name: string;
  date: string;
  orderDate?: string;
  formattedDate?: string;
  materialType?: string;
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
