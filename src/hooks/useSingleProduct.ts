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

      const productData = await apiService.getProductById(id);
      setProduct(productData);

      const images = productData ? [
        productData.image,
        ...(productData.additionalImages || [])
      ].filter((img, index, array) => 
        img && array.indexOf(img) === index
      ) : [];
      setGalleryImages(images);

      try {
        const reviewsData = await apiService.getReviewsByProductId(id);
        setReviews(reviewsData);
      } catch (reviewError) {
        setReviews([]);
      }
    } catch (err) {
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