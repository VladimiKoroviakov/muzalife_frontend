/**
 * @fileoverview Unit tests for {@link createOrdersMethods}.
 *
 * @module tests/unit/services/orders
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrdersMethods } from '@/services/api/orders';
import type { ApiClient } from '@/services/api/client';
import { ApiError } from '@/types';
import config from '@/config';

const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  authRequest: vi.fn(),
  postWithCustomAuth: vi.fn(),
  clearUserData: vi.fn(),
  clearProductsCache: vi.fn(),
  clearAllCache: vi.fn(),
  getCachedArray: vi.fn(),
  updateCachedArray: vi.fn(),
  token: null as string | null,
} as unknown as ApiClient;

const sampleOrder = {
  id: 1,
  orderTitle: 'Сценарій на весілля',
  orderDescription: 'Детальний опис замовлення',
  orderMaterialType: 'Сценарій',
  orderMaterialAgeCategory: 'Дорослі',
  orderDeadline: '2024-12-31',
  status: 'pending',
  price: null,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getPersonalOrders', () => {
  it('returns user personal orders on success', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({
      success: true,
      personalOrders: [sampleOrder],
    });

    const { getPersonalOrders } = createOrdersMethods(mockClient);
    const result = await getPersonalOrders();

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.personalOrders.base);
    expect(result).toEqual([sampleOrder]);
  });

  it('throws when response.success is false', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({
      success: false,
      error: 'Invalid response format',
      personalOrders: null,
    });

    const { getPersonalOrders } = createOrdersMethods(mockClient);
    await expect(getPersonalOrders()).rejects.toThrow('Invalid response format');
  });

  it('throws when personalOrders is not an array', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, personalOrders: null });

    const { getPersonalOrders } = createOrdersMethods(mockClient);
    await expect(getPersonalOrders()).rejects.toThrow();
  });

  it('throws with authentication message on 403', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(
      new ApiError('Forbidden', config.httpStatusCodes.FORBIDDEN)
    );

    const { getPersonalOrders } = createOrdersMethods(mockClient);
    await expect(getPersonalOrders()).rejects.toThrow('Authentication required');
  });

  it('rethrows other errors', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new Error('Network error'));

    const { getPersonalOrders } = createOrdersMethods(mockClient);
    await expect(getPersonalOrders()).rejects.toThrow('Network error');
  });
});

describe('getAllPersonalOrders', () => {
  it('returns all personal orders on success', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({
      success: true,
      personalOrders: [sampleOrder],
    });

    const { getAllPersonalOrders } = createOrdersMethods(mockClient);
    const result = await getAllPersonalOrders();

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.personalOrders.all);
    expect(result).toEqual([sampleOrder]);
  });

  it('throws with admin message on 403', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(
      new ApiError('Forbidden', config.httpStatusCodes.FORBIDDEN)
    );

    const { getAllPersonalOrders } = createOrdersMethods(mockClient);
    await expect(getAllPersonalOrders()).rejects.toThrow('Admin access required');
  });

  it('throws when success false with error', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, error: 'DB error', personalOrders: null });

    const { getAllPersonalOrders } = createOrdersMethods(mockClient);
    await expect(getAllPersonalOrders()).rejects.toThrow('DB error');
  });
});

describe('getPersonalOrderById', () => {
  it('returns a single order by ID', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({
      success: true,
      personalOrder: sampleOrder,
    });

    const { getPersonalOrderById } = createOrdersMethods(mockClient);
    const result = await getPersonalOrderById(1);

    expect(mockClient.get).toHaveBeenCalledWith(
      `${config.endpoints.personalOrders.base}/1`
    );
    expect(result).toEqual(sampleOrder);
  });

  it('throws "Order not found" on 404', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(
      new ApiError('Not found', config.httpStatusCodes.NOT_FOUND)
    );

    const { getPersonalOrderById } = createOrdersMethods(mockClient);
    await expect(getPersonalOrderById(999)).rejects.toThrow('Order not found');
  });

  it('throws when response format is invalid', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, error: 'bad data', personalOrder: null });

    const { getPersonalOrderById } = createOrdersMethods(mockClient);
    await expect(getPersonalOrderById(1)).rejects.toThrow('bad data');
  });
});

describe('createPersonalOrder', () => {
  const orderData = {
    orderTitle: 'Сценарій',
    orderDescription: 'Опис',
    orderMaterialType: 'Сценарій',
    orderMaterialAgeCategory: 'Дорослі',
    orderDeadline: '2024-12-31',
  };

  it('creates an order and returns it', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true, personalOrder: sampleOrder });

    const { createPersonalOrder } = createOrdersMethods(mockClient);
    const result = await createPersonalOrder(orderData);

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.personalOrders.base,
      {
        orderTitle: orderData.orderTitle,
        orderDescription: orderData.orderDescription,
        orderMaterialType: orderData.orderMaterialType,
        orderMaterialAgeCategory: orderData.orderMaterialAgeCategory,
        orderDeadline: orderData.orderDeadline,
      }
    );
    expect(result).toEqual(sampleOrder);
  });

  it('uses null when orderDeadline is not provided', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true, personalOrder: sampleOrder });

    const { createPersonalOrder } = createOrdersMethods(mockClient);
    await createPersonalOrder({ ...orderData, orderDeadline: undefined });

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.personalOrders.base,
      expect.objectContaining({ orderDeadline: null })
    );
  });

  it('throws when response is invalid', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: false, error: 'Failed', personalOrder: null });

    const { createPersonalOrder } = createOrdersMethods(mockClient);
    await expect(createPersonalOrder(orderData)).rejects.toThrow('Failed');
  });
});

describe('updatePersonalOrder', () => {
  it('updates and returns the order', async () => {
    vi.mocked(mockClient.put).mockResolvedValue({ success: true, personalOrder: sampleOrder });

    const { updatePersonalOrder } = createOrdersMethods(mockClient);
    const result = await updatePersonalOrder(1, { orderTitle: 'New title' });

    expect(mockClient.put).toHaveBeenCalledWith(
      `${config.endpoints.personalOrders.base}/1`,
      { orderTitle: 'New title' }
    );
    expect(result).toEqual(sampleOrder);
  });

  it('throws "Order not found" when error includes not found', async () => {
    vi.mocked(mockClient.put).mockResolvedValue({
      success: false,
      error: 'Order not found in DB',
      personalOrder: null,
    });

    const { updatePersonalOrder } = createOrdersMethods(mockClient);
    await expect(updatePersonalOrder(1, {})).rejects.toThrow('Order not found');
  });

  it('throws authorization message when error includes authorized', async () => {
    vi.mocked(mockClient.put).mockResolvedValue({
      success: false,
      error: 'Not authorized to modify',
      personalOrder: null,
    });

    const { updatePersonalOrder } = createOrdersMethods(mockClient);
    await expect(updatePersonalOrder(1, {})).rejects.toThrow('Not authorized to update');
  });

  it('throws generic message for other errors', async () => {
    vi.mocked(mockClient.put).mockResolvedValue({
      success: false,
      error: 'Invalid data',
      personalOrder: null,
    });

    const { updatePersonalOrder } = createOrdersMethods(mockClient);
    await expect(updatePersonalOrder(1, {})).rejects.toThrow('Invalid data');
  });
});

describe('deletePersonalOrder', () => {
  it('deletes an order successfully', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: true });

    const { deletePersonalOrder } = createOrdersMethods(mockClient);
    await expect(deletePersonalOrder(1)).resolves.toBeUndefined();

    expect(mockClient.delete).toHaveBeenCalledWith(
      `${config.endpoints.personalOrders.base}/1`
    );
  });

  it('throws "Order not found" when delete response includes not found', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({
      success: false,
      error: 'Order not found',
    });

    const { deletePersonalOrder } = createOrdersMethods(mockClient);
    await expect(deletePersonalOrder(1)).rejects.toThrow('Order not found');
  });

  it('throws authorization message when delete response includes authorized', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({
      success: false,
      error: 'Not authorized to delete',
    });

    const { deletePersonalOrder } = createOrdersMethods(mockClient);
    await expect(deletePersonalOrder(1)).rejects.toThrow('Not authorized to delete');
  });

  it('throws generic message for other delete failures', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({
      success: false,
      error: 'DB error',
    });

    const { deletePersonalOrder } = createOrdersMethods(mockClient);
    await expect(deletePersonalOrder(1)).rejects.toThrow('DB error');
  });

  it('throws with fallback message when no error provided', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: false });

    const { deletePersonalOrder } = createOrdersMethods(mockClient);
    await expect(deletePersonalOrder(1)).rejects.toThrow('Failed to delete personal order');
  });
});
