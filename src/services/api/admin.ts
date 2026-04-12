/**
 * @fileoverview Admin-only API methods: product management, personal order
 * oversight, product analytics, and poll administration.
 *
 * All methods require a valid admin JWT — the backend returns 403 if the
 * authenticated user does not have `is_admin = true`.
 *
 * @module services/api/admin
 */

import config from '../../config';
import {
  Product,
  ProductFile,
  CreateProductData,
  UpdateProductData,
  AdminProductApiResponse,
  ProductAnalytics,
  AnalyticsProduct,
  PersonalOrder,
  CreatePersonalOrderData,
  UpdatePersonalOrderData,
  PersonalOrdersApiResponse,
  ApiPoll,
  CreatePollData,
  PollResult,
  PollResultsResponse,
  AdminPollResponse,
  ApiError,
} from '../../types';
import { ApiClient } from './client';

/**
 * Creates admin-only API methods bound to the given HTTP client.
 *
 * @param client - Shared API transport client.
 * @returns Object containing all admin API methods.
 * @example
 * ```ts
 * const { adminAddProduct } = createAdminMethods(client);
 * const product = await adminAddProduct(data, files);
 * ```
 */
export function createAdminMethods(client: ApiClient) {
  return {
    // ── Products ─────────────────────────────────────────────────────────────

    /**
     * Creates a new product via `multipart/form-data`.
     *
     * @param data        - Required product fields (title, description, price, typeId, etc.).
     * @param attachments - Files to attach: main image, gallery images, and downloadable files.
     * @returns The newly created product.
     */
    async adminAddProduct(
      data: CreateProductData,
      attachments: { mainImage?: File; images?: File[]; files?: File[] },
    ): Promise<Product> {
      const formData = new FormData();

      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', String(data.price));
      formData.append('typeId', String(data.typeId));

      if (data.hidden !== undefined) {
        formData.append('hidden', String(data.hidden));
      }
      for (const id of data.ageCategoryIds ?? []) {
        formData.append('ageCategoryIds', String(id));
      }
      for (const id of data.eventIds ?? []) {
        formData.append('eventIds', String(id));
      }
      if (attachments.mainImage) {
        formData.append('mainImage', attachments.mainImage);
      }
      for (const img of attachments.images ?? []) {
        formData.append('images', img);
      }
      for (const file of attachments.files ?? []) {
        formData.append('files', file);
      }

      const response = await fetch(`${config.apiUrl}${config.endpoints.products}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${client.token}` },
        body: formData,
      });

      const json = await response.json() as AdminProductApiResponse;

      if (!response.ok || !json.success) {
        throw new ApiError(json.error ?? 'Failed to create product', response.status);
      }
      if (!json.product) {
        throw new ApiError('Invalid response: missing product', response.status);
      }

      return json.product;
    },

    /**
     * Updates an existing product's fields and optionally adds / removes files.
     *
     * Uses `multipart/form-data` so new downloadable files can be appended in
     * the same request.  Only supplied fields are applied (PATCH semantics).
     *
     * @param id          - Product ID to update.
     * @param data        - Partial product fields to change.
     * @param attachments - Optional new files to upload and/or existing file IDs to remove.
     */
    async adminUpdateProduct(
        id: number,
        data: UpdateProductData,
        attachments?: {
            files?: File[];
            removeFileIds?: number[];
            images?: File[];
            removeImageUrls?: string[];
            removeMainImage?: boolean;
        },
    ): Promise<void> {
        const formData = new FormData();

        if (data.title !== undefined) { formData.append('title', data.title); }
        if (data.description !== undefined) { formData.append('description', data.description); }
        if (data.price !== undefined) { formData.append('price', String(data.price)); }
        if (data.typeId !== undefined) { formData.append('typeId', String(data.typeId)); }

        if (data.ageCategoryIds !== undefined) {
            for (const catId of data.ageCategoryIds) {
                formData.append('ageCategoryIds', String(catId));
            }
            if (data.ageCategoryIds.length === 0) {
                formData.append('ageCategoryIds', '');
            }
        }
        if (data.eventIds !== undefined) {
            for (const evtId of data.eventIds) {
                formData.append('eventIds', String(evtId));
            }
            if (data.eventIds.length === 0) {
                formData.append('eventIds', '');
            }
        }
        for (const fileId of attachments?.removeFileIds ?? []) {
            formData.append('removeFileIds', String(fileId));
        }
        for (const imageUrl of attachments?.removeImageUrls ?? []) {
            formData.append('removeImageUrls', String(imageUrl));
        }
        for (const file of attachments?.files ?? []) {
            formData.append('files', file);
        }
        for (const image of attachments?.images ?? []) {
            formData.append('images', image);
        }
        if (attachments?.removeMainImage) {
            formData.append('removeMainImage', 'true');
        }

        const response = await fetch(`${config.apiUrl}${config.endpoints.products}/${id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${client.token}` },
            body: formData,
        });

        const json = await response.json() as { success: boolean; error?: string };

        if (!response.ok || !json.success) {
            if (json.error?.includes('not found')) {
            throw new ApiError('Product not found', response.status);
            }
            throw new ApiError(json.error ?? 'Failed to update product', response.status);
        }
    },

    /**
     * Retrieves the downloadable files attached to a product (admin only).
     *
     * @param id - Product ID.
     * @returns Array of file metadata objects.
     * @example
     * ```ts
     * const files = await adminGetProductFiles(42);
     * // [{ fileId: 1, fileName: 'script.pdf', fileUrl: '/uploads/...', fileSize: 12345 }]
     * ```
     */
    async adminGetProductFiles(id: number): Promise<ProductFile[]> {
      const response = await client.get<{ success: boolean; files: ProductFile[]; error?: string }>(
        config.endpoints.productFiles(id),
      );

      if (!response.success) {
        throw new ApiError(response.error ?? 'Failed to fetch product files', 500);
      }

      return response.files;
    },

    /**
     * Permanently deletes a product.
     *
     * @param id - Product ID to delete.
     */
    async adminDeleteProduct(id: number): Promise<void> {
      const response = await client.delete<AdminProductApiResponse>(
        `${config.endpoints.products}/${id}`
      );

      if (!response.success) {
        if (response.error?.includes('not found')) {
          throw new Error('Product not found');
        }
        throw new Error(response.error ?? 'Failed to delete product');
      }
    },

    // ── Personal Orders (admin view) ─────────────────────────────────────────

    /**
     * Creates a new personal order (admin-initiated).
     *
     * @param orderData - Order fields.
     * @returns The created personal order.
     */
    async adminCreatePersonalOrder(orderData: CreatePersonalOrderData): Promise<PersonalOrder> {
      const response = await client.post<PersonalOrdersApiResponse>(
        config.endpoints.personalOrders.base,
        {
          orderTitle: orderData.orderTitle,
          orderDescription: orderData.orderDescription,
          orderMaterialType: orderData.orderMaterialType,
          orderMaterialAgeCategory: orderData.orderMaterialAgeCategory,
          orderDeadline: orderData.orderDeadline ?? null,
        }
      );

      if (!response.success || !response.personalOrder) {
        throw new Error(response.error ?? 'Failed to create personal order');
      }

      return response.personalOrder;
    },

    /**
     * Retrieves all personal orders across all users.
     *
     * @returns Array of all personal orders, including `user_name` and `user_email`.
     */
    async adminGetAllPersonalOrders(): Promise<PersonalOrder[]> {
      try {
        const response = await client.get<PersonalOrdersApiResponse>(
          config.endpoints.personalOrders.all
        );

        if (response.success && Array.isArray(response.personalOrders)) {
          return response.personalOrders;
        }

        throw new Error(response.error ?? 'Invalid response format');
      } catch (error) {
        if (error instanceof ApiError && error.status === config.httpStatusCodes.FORBIDDEN) {
          throw new Error('Admin access required to view all personal orders', { cause: error });
        }
        throw error;
      }
    },

    /**
     * Retrieves a single personal order by ID.
     *
     * @param orderId - Order ID.
     * @returns The personal order.
     */
    async adminGetPersonalOrderById(orderId: number): Promise<PersonalOrder> {
      try {
        const response = await client.get<PersonalOrdersApiResponse>(
          `${config.endpoints.personalOrders.base}/${orderId}`
        );

        if (response.success && response.personalOrder) {
          return response.personalOrder;
        }

        throw new Error(response.error ?? 'Invalid response format');
      } catch (error) {
        if (error instanceof ApiError && error.status === config.httpStatusCodes.NOT_FOUND) {
          throw new Error('Order not found', { cause: error });
        }
        throw error;
      }
    },

    /**
     * Updates a personal order (admin can change any field including status and price).
     *
     * @param orderId    - Order ID to update.
     * @param updateData - Partial order fields to change.
     * @returns The updated personal order.
     */
    async adminUpdatePersonalOrder(
      orderId: number,
      updateData: UpdatePersonalOrderData
    ): Promise<PersonalOrder> {
      const response = await client.put<PersonalOrdersApiResponse>(
        `${config.endpoints.personalOrders.base}/${orderId}`,
        updateData as unknown as object
      );

      if (response.success && response.personalOrder) {
        return response.personalOrder;
      }

      if (response.error?.includes('not found')) {
        throw new Error('Order not found');
      }

      throw new Error(response.error ?? 'Failed to update personal order');
    },

    /**
     * Permanently deletes a personal order.
     *
     * @param orderId - Order ID to delete.
     */
    async adminDeletePersonalOrder(orderId: number): Promise<void> {
      const response = await client.delete<PersonalOrdersApiResponse>(
        `${config.endpoints.personalOrders.base}/${orderId}`
      );

      if (!response.success) {
        if (response.error?.includes('not found')) {
          throw new Error('Order not found');
        }
        throw new Error(response.error ?? 'Failed to delete personal order');
      }
    },

    // ── Analytics ────────────────────────────────────────────────────────────

    /**
     * Retrieves engagement and sales analytics for a specific product
     * within an optional date window.
     *
     * @param productId - Product ID to fetch stats for.
     * @param timeFrom  - ISO 8601 window start (optional, defaults to 30 days ago on the backend).
     * @param timeTo    - ISO 8601 window end (optional, defaults to now on the backend).
     * @returns Analytics snapshot including views, purchases, saves,
     *          averageRating, reviewCount, and revenue.
     */
    async getProductAnalytics(
      productId: number,
      timeFrom?: string,
      timeTo?: string,
    ): Promise<ProductAnalytics> {
      const params = new URLSearchParams();
      if (timeFrom) {params.set('timeFrom', timeFrom);}
      if (timeTo)   {params.set('timeTo',   timeTo);}
      const qs = params.toString();
      const endpoint = `${config.endpoints.analytics.stats(productId)}${qs ? `?${qs}` : ''}`;

      try {
        const response = await client.get<{
          success: boolean;
          analytics: ProductAnalytics;
          error?: string;
        }>(endpoint);

        if (response.success && response.analytics) {
          return response.analytics;
        }

        throw new Error(response.error ?? 'Failed to fetch product analytics');
      } catch (error) {
        if (error instanceof ApiError && error.status === config.httpStatusCodes.NOT_FOUND) {
          throw new Error('Product not found', { cause: error });
        }
        throw error;
      }
    },

    /**
     * Retrieves the full product list including hidden/soft-deleted products
     * for the admin analytics product selector.
     *
     * @returns Array of lightweight product descriptors with `id`, `title`, and `hidden` flag.
     */
    async getAnalyticsProducts(): Promise<AnalyticsProduct[]> {
      try {
        const response = await client.get<{
          success: boolean;
          products: AnalyticsProduct[];
          error?: string;
        }>(config.endpoints.analytics.products);

        if (response.success && Array.isArray(response.products)) {
          return response.products;
        }

        throw new Error(response.error ?? 'Failed to fetch analytics products');
      } catch (error) {
        if (error instanceof ApiError && error.status === config.httpStatusCodes.FORBIDDEN) {
          throw new Error('Admin access required', { cause: error });
        }
        throw error;
      }
    },

    // ── Polls (admin) ─────────────────────────────────────────────────────────

    /**
     * Creates a new community poll.
     *
     * @param data - Poll question and answer options.
     * @returns The created poll in raw API shape.
     */
    async adminCreatePoll(data: CreatePollData): Promise<ApiPoll> {
      const response = await client.post<AdminPollResponse>(
        config.endpoints.polls.base,
        { poll_question: data.pollQuestion, options: data.options }
      );

      if (!response.success || !response.poll) {
        throw new Error(response.error ?? 'Failed to create poll');
      }

      return response.poll;
    },

    /**
     * Opens or closes a poll by toggling its `is_active` status.
     *
     * @param pollId   - Poll ID.
     * @param isActive - `true` to reopen, `false` to close.
     */
    async adminSetPollStatus(pollId: number, isActive: boolean): Promise<void> {
      const response = await client.put<AdminPollResponse>(
        config.endpoints.polls.status(pollId),
        { is_active: isActive }
      );

      if (!response.success) {
        if (response.error?.includes('not found')) {
          throw new Error('Poll not found');
        }
        throw new Error(response.error ?? 'Failed to update poll status');
      }
    },

    /**
     * Permanently deletes a poll and all its options and user votes.
     *
     * @param pollId - Poll ID to delete.
     */
    async adminDeletePoll(pollId: number): Promise<void> {
      const response = await client.delete<{ success: boolean; error?: string }>(
        config.endpoints.polls.delete(pollId),
      );

      if (!response.success) {
        if (response.error?.includes('not found')) {
          throw new Error('Poll not found');
        }
        throw new Error(response.error ?? 'Failed to delete poll');
      }
    },

    /**
     * Retrieves voting results for all polls, including closed ones.
     *
     * @returns Array of polls with per-option vote counts.
     */
    async adminGetPollResults(): Promise<PollResult[]> {
      const response = await client.get<PollResultsResponse>(config.endpoints.polls.results);

      if (response.success && Array.isArray(response.polls)) {
        return response.polls;
      }

      throw new Error(response.error ?? 'Failed to fetch poll results');
    },

    // ── Facebook ──────────────────────────────────────────────────────────────

    /**
     * Publishes a Facebook post for the given product.
     * If `images` or `text` are omitted the backend falls back to the
     * product's own images and description.
     *
     * @param productId - ID of the product to promote.
     * @param data      - Optional override images and post text.
     */
    async adminPublishFacebookPost(
      productId: number,
      data: { images?: File[]; text?: string },
    ): Promise<void> {
      const formData = new FormData();
      formData.append('productId', String(productId));
      if (data.text) {
        formData.append('text', data.text);
      }
      for (const img of data.images ?? []) {
        formData.append('images', img);
      }

      const response = await fetch(`${config.apiUrl}${config.endpoints.facebookPost}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${client.token}` },
        body: formData,
      });

      const json = await response.json() as { success: boolean; error?: string };

      if (!response.ok || !json.success) {
        throw new ApiError(json.error ?? 'Failed to publish Facebook post', response.status);
      }
    },
  };
}
