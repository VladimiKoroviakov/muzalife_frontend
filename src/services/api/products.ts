/**
 * @fileoverview Product catalogue, saved-products, and bought-products API methods.
 *
 * @module services/api/products
 */

import config from '../../config';
import { CacheManager } from '../../utils/cache-manager';
import { Product, ApiResponse } from '../../types';
import { ApiClient } from './client';

/**
 * Creates product-catalogue, saved-products, and bought-products methods
 * bound to the given HTTP client.
 *
 * @param client - Shared API transport client.
 * @returns Object containing all product-related API methods.
 * @example
 * ```ts
 * const { getProducts } = createProductsMethods(client);
 * const products = await getProducts();
 * ```
 */
export function createProductsMethods(client: ApiClient) {
  return {
    async getProducts(): Promise<Product[]> {
      const cachedProducts = CacheManager.getItem<Product[]>(config.cacheKeys.PRODUCTS);
      const isCacheValid = CacheManager.isCacheValid(
        config.cacheKeys.PRODUCTS,
        config.cacheDurations.PRODUCTS
      );

      if (cachedProducts && isCacheValid) {
        return cachedProducts;
      }

      try {
        const products = await client.get<Product[]>(config.endpoints.products);
        CacheManager.setWithTimestamp(config.cacheKeys.PRODUCTS, products);
        return products;
      } catch (error) {
        if (cachedProducts) {
          return cachedProducts;
        }
        throw error;
      }
    },

    async getProductById(id: string): Promise<Product> {
      return client.get<Product>(`${config.endpoints.products}/${id}`);
    },

    // ── Saved products ──────────────────────────────────────────────────────

    async getSavedProducts(): Promise<number[]> {
      const cached = CacheManager.getItem<number[]>(config.cacheKeys.SAVED_PRODUCTS);
      if (cached) {
        return cached;
      }

      try {
        const response = await client.get<ApiResponse<number[]>>(config.endpoints.savedProducts.ids);

        if (response.success && Array.isArray(response.data)) {
          CacheManager.setItem(config.cacheKeys.SAVED_PRODUCTS, response.data);
          return response.data;
        }

        throw new Error(response.error || 'Invalid response format');
      } catch {
        return cached || [];
      }
    },

    async saveProduct(productId: number): Promise<void> {
      const response = await client.post<ApiResponse<void>>(
        config.endpoints.savedProducts.base,
        { productId }
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to save product');
      }

      client.updateCachedArray<number>(config.cacheKeys.SAVED_PRODUCTS, productId, 'add');
    },

    async unsaveProduct(productId: number): Promise<void> {
      const response = await client.delete<ApiResponse<void>>(
        `${config.endpoints.savedProducts.base}/${productId}`
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to unsave product');
      }

      client.updateCachedArray<number>(config.cacheKeys.SAVED_PRODUCTS, productId, 'remove');
    },

    // ── Bought products ─────────────────────────────────────────────────────

    async getBoughtProducts(): Promise<number[]> {
      const cached = CacheManager.getItem<number[]>(config.cacheKeys.BOUGHT_PRODUCTS);
      if (cached) {
        return cached;
      }

      try {
        const response = await client.get<ApiResponse<number[]>>(config.endpoints.boughtProducts.ids);

        if (response.success && Array.isArray(response.data)) {
          CacheManager.setItem(config.cacheKeys.BOUGHT_PRODUCTS, response.data);
          return response.data;
        }

        throw new Error(response.error || 'Invalid response format');
      } catch {
        return cached || [];
      }
    },

    async buyProduct(productId: number): Promise<void> {
      const response = await client.post<ApiResponse<void>>(
        config.endpoints.boughtProducts.base,
        { productId }
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to save bought product');
      }

      client.updateCachedArray<number>(config.cacheKeys.BOUGHT_PRODUCTS, productId, 'add');
    },
  };
}
