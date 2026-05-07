/**
 * @fileoverview Unit tests for {@link createPaymentsMethods}.
 *
 * @module tests/unit/services/payments
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPaymentsMethods } from '@/services/api/payments';
import type { ApiClient } from '@/services/api/client';
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

const samplePaymentData = {
  data: 'base64-encoded-data',
  signature: 'liqpay-signature',
  amount: 299,
  currency: 'UAH',
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('initiateProductPayment', () => {
  it('posts to the product payment endpoint and returns response.data', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true, data: samplePaymentData });

    const { initiateProductPayment } = createPaymentsMethods(mockClient);
    const result = await initiateProductPayment(42);

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.payments.initiateProduct(42),
      {}
    );
    expect(result).toEqual(samplePaymentData);
  });

  it('propagates errors from the client', async () => {
    vi.mocked(mockClient.post).mockRejectedValue(new Error('Product not found'));

    const { initiateProductPayment } = createPaymentsMethods(mockClient);
    await expect(initiateProductPayment(999)).rejects.toThrow('Product not found');
  });
});

describe('initiateOrderPayment', () => {
  it('posts to the order payment endpoint and returns response.data', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true, data: samplePaymentData });

    const { initiateOrderPayment } = createPaymentsMethods(mockClient);
    const result = await initiateOrderPayment(7);

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.payments.initiateOrder(7),
      {}
    );
    expect(result).toEqual(samplePaymentData);
  });
});

describe('verifyPayment', () => {
  it('posts to the verify endpoint with the orderId', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true, data: null });

    const { verifyPayment } = createPaymentsMethods(mockClient);
    await verifyPayment('cart_42_1234567890');

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.payments.verify,
      { orderId: 'cart_42_1234567890' }
    );
  });

  it('resolves without returning a value', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true, data: null });

    const { verifyPayment } = createPaymentsMethods(mockClient);
    await expect(verifyPayment('order_7_1234567890')).resolves.toBeUndefined();
  });
});

describe('initiateCartPayment — authenticated user', () => {
  it('uses client.post when no guestToken is provided', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true, data: samplePaymentData });

    const { initiateCartPayment } = createPaymentsMethods(mockClient);
    const result = await initiateCartPayment([1, 2, 3]);

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.payments.initiateCart,
      { productIds: [1, 2, 3] }
    );
    expect(mockClient.postWithCustomAuth).not.toHaveBeenCalled();
    expect(result).toEqual(samplePaymentData);
  });
});

describe('initiateCartPayment — guest user', () => {
  it('uses client.postWithCustomAuth when guestToken is provided', async () => {
    vi.mocked(mockClient.postWithCustomAuth).mockResolvedValue({ success: true, data: samplePaymentData });

    const { initiateCartPayment } = createPaymentsMethods(mockClient);
    const result = await initiateCartPayment([1, 2], 'guest-jwt-token');

    expect(mockClient.postWithCustomAuth).toHaveBeenCalledWith(
      config.endpoints.payments.initiateCart,
      { productIds: [1, 2] },
      'guest-jwt-token'
    );
    expect(mockClient.post).not.toHaveBeenCalled();
    expect(result).toEqual(samplePaymentData);
  });
});

describe('verifyGuestPayment', () => {
  it('calls client.postWithCustomAuth with orderId and guestToken', async () => {
    vi.mocked(mockClient.postWithCustomAuth).mockResolvedValue({ success: true, data: null });

    const { verifyGuestPayment } = createPaymentsMethods(mockClient);
    await verifyGuestPayment('cart_5_123', 'guest-jwt-456');

    expect(mockClient.postWithCustomAuth).toHaveBeenCalledWith(
      config.endpoints.payments.verify,
      { orderId: 'cart_5_123' },
      'guest-jwt-456'
    );
  });

  it('resolves without returning a value', async () => {
    vi.mocked(mockClient.postWithCustomAuth).mockResolvedValue({ success: true, data: null });

    const { verifyGuestPayment } = createPaymentsMethods(mockClient);
    await expect(verifyGuestPayment('order_1_123', 'token')).resolves.toBeUndefined();
  });
});
