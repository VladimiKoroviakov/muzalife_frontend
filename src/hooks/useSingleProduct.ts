import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Product, Review, UseSingleProduct } from '../types';

export const useSingleProduct = (id: string | undefined): UseSingleProduct => {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductData = async () => {
    if (!id) {
      setError('Product ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch product
      const productData = await apiService.getProductById(id);
      setProduct(productData);

      // Process images
      const images = productData ? [
        productData.image,
        ...(productData.additionalImages || [])
      ].filter((img, index, array) => 
        img && array.indexOf(img) === index
      ) : [];
      setGalleryImages(images);

      // Fetch reviews - convert id to number
      try {
        const productId = parseInt(id, 10);
        if (!isNaN(productId)) {
          const reviewsData = await apiService.getReviewsByProductId(productId);
          setReviews(reviewsData);
        } else {
          console.warn(`Invalid product ID for reviews: ${id}`);
          setReviews([]);
        }
      } catch (reviewError: any) {
        console.error('Error fetching reviews:', reviewError);
        // Don't set error for reviews - just show empty reviews
        setReviews([]);
      }
    } catch (err: any) {
      console.error('Error fetching product:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Не вдалося завантажити інформацію про продукт. Спробуйте оновити сторінку.';
      setError(errorMessage);
      setProduct(null);
      setReviews([]);
      setGalleryImages([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  return { 
    product, 
    reviews, 
    galleryImages,
    loading, 
    error, 
    refetch: fetchProductData 
  };
};