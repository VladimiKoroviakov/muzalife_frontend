/**
 * @fileoverview Personal orders API methods.
 *
 * Covers the full lifecycle of a custom material request: listing (user and
 * admin views), fetching a single order, creating, updating, and deleting.
 *
 * @module services/api/orders
 */

import config from '../../config';
import {
  PersonalOrder,
  CreatePersonalOrderData,
  UpdatePersonalOrderData,
  PersonalOrdersApiResponse,
  ApiError,
} from '../../types';
import { ApiClient } from './client';

/**
 * Creates personal-orders methods bound to the given HTTP client.
 *
 * @param client - Shared API transport client.
 * @returns Object containing all personal-order API methods.
 * @example
 * ```ts
 * const { getPersonalOrders } = createOrdersMethods(client);
 * const orders = await getPersonalOrders();
 * ```
 */
export function createOrdersMethods(client: ApiClient) {
  return {
    async getPersonalOrders(): Promise<PersonalOrder[]> {
      try {
        const response = await client.get<PersonalOrdersApiResponse>(config.endpoints.personalOrders.base);

        if (response.success && Array.isArray(response.personalOrders)) {
          return response.personalOrders;
        }

        throw new Error(response.error || 'Invalid response format');
      } catch (error) {
        if (error instanceof ApiError && error.status === config.httpStatusCodes.FORBIDDEN) {
          throw new Error('Authentication required to view personal orders', { cause: error });
        }
        throw error;
      }
    },

    async getAllPersonalOrders(): Promise<PersonalOrder[]> {
      try {
        const response = await client.get<PersonalOrdersApiResponse>(config.endpoints.personalOrders.all);

        if (response.success && Array.isArray(response.personalOrders)) {
          return response.personalOrders;
        }

        throw new Error(response.error || 'Invalid response format');
      } catch (error) {
        if (error instanceof ApiError && error.status === config.httpStatusCodes.FORBIDDEN) {
          throw new Error('Admin access required to view all personal orders', { cause: error });
        }
        throw error;
      }
    },

    async getPersonalOrderById(orderId: number): Promise<PersonalOrder> {
      try {
        const response = await client.get<PersonalOrdersApiResponse>(
          `${config.endpoints.personalOrders.base}/${orderId}`
        );

        if (response.success && response.personalOrder) {
          return response.personalOrder;
        }

        throw new Error(response.error || 'Invalid response format');
      } catch (error) {
        if (error instanceof ApiError && error.status === config.httpStatusCodes.NOT_FOUND) {
          throw new Error('Order not found', { cause: error });
        }
        throw error;
      }
    },

    async createPersonalOrder(orderData: CreatePersonalOrderData): Promise<PersonalOrder> {
      const dataToSend = {
        orderTitle: orderData.orderTitle,
        orderDescription: orderData.orderDescription,
        orderStatus: orderData.orderStatus || 'pending',
        orderPrice: orderData.orderPrice || 0,
        orderMaterialType: orderData.orderMaterialType,
        orderMaterialAgeCategory: orderData.orderMaterialAgeCategory,
        orderDeadline: orderData.orderDeadline || null,
      };

      const response = await client.post<PersonalOrdersApiResponse>(
        config.endpoints.personalOrders.base,
        dataToSend
      );

      if (response.success && response.personalOrder) {
        return response.personalOrder;
      }

      throw new Error(response.error || 'Invalid response format');
    },

    async updatePersonalOrder(
      orderId: number,
      updateData: UpdatePersonalOrderData
    ): Promise<PersonalOrder> {
      const response = await client.put<PersonalOrdersApiResponse>(
        `${config.endpoints.personalOrders.base}/${orderId}`,
        updateData
      );

      if (response.success && response.personalOrder) {
        return response.personalOrder;
      }

      if (response.error?.includes('not found')) {
        throw new Error('Order not found');
      }
      if (response.error?.includes('authorized')) {
        throw new Error('Not authorized to update this order');
      }

      throw new Error(response.error || 'Invalid update data provided');
    },

    async deletePersonalOrder(orderId: number): Promise<void> {
      const response = await client.delete<PersonalOrdersApiResponse>(
        `${config.endpoints.personalOrders.base}/${orderId}`
      );

      if (!response.success) {
        if (response.error?.includes('not found')) {
          throw new Error('Order not found');
        }
        if (response.error?.includes('authorized')) {
          throw new Error('Not authorized to delete this order');
        }
        throw new Error(response.error || 'Failed to delete personal order');
      }
    },
  };
}
