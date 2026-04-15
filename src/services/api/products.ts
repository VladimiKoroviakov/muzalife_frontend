/**
 * @fileoverview Product catalogue, saved-products, and bought-products API methods.
 *
 * @module services/api/products
 */

import config from '../../config';
import { CacheManager } from '../../utils/cache-manager';
import { Product, BoughtProduct, ApiResponse, ProductTypeLookup, AgeCategoryLookup, EventLookup } from '../../types';
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

    async getBoughtProducts(): Promise<BoughtProduct[]> {
      const cached = CacheManager.getItem<BoughtProduct[]>(config.cacheKeys.BOUGHT_PRODUCTS);
      const isValidCache = Array.isArray(cached) && (cached.length === 0 || typeof cached[0] === 'object');
      if (!isValidCache) {
        CacheManager.removeItem(config.cacheKeys.BOUGHT_PRODUCTS);
      }
      if (cached && isValidCache) {
        return cached;
      }

      try {
        const response = await client.get<ApiResponse<BoughtProduct[]>>(config.endpoints.boughtProducts.base);

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

      CacheManager.removeItem(config.cacheKeys.BOUGHT_PRODUCTS);
    },

    /**
     * Sends (or resends) the download links for a purchased product to the
     * authenticated user's registered email address.
     *
     * @param productId - ID of the product whose materials should be emailed.
     * @example
     * ```ts
     * await apiService.resendProductMaterials(42);
     * ```
     */
    async resendProductMaterials(productId: number): Promise<void> {
      const response = await client.post<ApiResponse<void>>(
        config.endpoints.boughtProducts.sendMaterials(productId),
        {}
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to resend materials');
      }
    },

    // ── Product metadata ────────────────────────────────────────────────────

    /**
     * Fetches all product types from the backend, using a 1-hour localStorage cache.
     *
     * @returns Array of `{ id, name }` records from the `ProductTypes` table.
     * @example
     * ```ts
     * const types = await apiService.getProductTypes();
     * // [{ id: 1, name: 'Сценарій' }, ...]
     * ```
     */
    async getProductTypes(): Promise<ProductTypeLookup[]> {
      const cached = CacheManager.getItem<ProductTypeLookup[]>(config.cacheKeys.PRODUCT_TYPES);
      if (cached && CacheManager.isCacheValid(config.cacheKeys.PRODUCT_TYPES, config.cacheDurations.PRODUCT_METADATA)) {
        return cached;
      }
      try {
        const response = await client.get<{ success: boolean; data: ProductTypeLookup[] }>(config.endpoints.productTypes);
        CacheManager.setWithTimestamp(config.cacheKeys.PRODUCT_TYPES, response.data);
        return response.data;
      } catch (error) {
        if (cached) { return cached; }
        throw error;
      }
    },

    /**
     * Fetches all age categories from the backend, using a 1-hour localStorage cache.
     *
     * @returns Array of `{ id, name }` records from the `AgeCategories` table.
     * @example
     * ```ts
     * const cats = await apiService.getAgeCategories();
     * // [{ id: 1, name: 'Дошкільний вік' }, ...]
     * ```
     */
    async getAgeCategories(): Promise<AgeCategoryLookup[]> {
      const cached = CacheManager.getItem<AgeCategoryLookup[]>(config.cacheKeys.AGE_CATEGORIES);
      if (cached && CacheManager.isCacheValid(config.cacheKeys.AGE_CATEGORIES, config.cacheDurations.PRODUCT_METADATA)) {
        return cached;
      }
      try {
        const response = await client.get<{ success: boolean; data: AgeCategoryLookup[] }>(config.endpoints.productAgeCategories);
        CacheManager.setWithTimestamp(config.cacheKeys.AGE_CATEGORIES, response.data);
        return response.data;
      } catch (error) {
        if (cached) { return cached; }
        throw error;
      }
    },

    /**
     * Fetches all events from the backend, using a 1-hour localStorage cache.
     *
     * @returns Array of `{ id, name }` records from the `Events` table.
     * @example
     * ```ts
     * const events = await apiService.getEvents();
     * // [{ id: 1, name: 'Новий рік' }, ...]
     * ```
     */
    async getEvents(): Promise<EventLookup[]> {
      const cached = CacheManager.getItem<EventLookup[]>(config.cacheKeys.EVENTS);
      if (cached && CacheManager.isCacheValid(config.cacheKeys.EVENTS, config.cacheDurations.PRODUCT_METADATA)) {
        return cached;
      }
      try {
        const response = await client.get<{ success: boolean; data: EventLookup[] }>(config.endpoints.productEvents);
        CacheManager.setWithTimestamp(config.cacheKeys.EVENTS, response.data);
        return response.data;
      } catch (error) {
        if (cached) { return cached; }
        throw error;
      }
    },
  };
}
