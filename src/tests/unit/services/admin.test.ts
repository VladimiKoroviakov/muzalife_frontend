/**
 * @fileoverview Unit tests for {@link createAdminMethods}.
 *
 * @module tests/unit/services/admin
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAdminMethods } from '@/services/api/admin';
import type { ApiClient } from '@/services/api/client';
import { ApiError } from '@/types';
import config from '@/config';

const mockFetch = vi.fn();

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
  token: 'admin-jwt-token',
} as unknown as ApiClient;

const sampleProduct = {
  id: 1,
  title: 'Сценарій на НР',
  description: 'Опис',
  price: 299,
  typeId: 1,
};

const sampleOrder = {
  id: 1,
  orderTitle: 'Замовлення',
  status: 'pending',
};

const sampleFile = {
  fileId: 1,
  fileName: 'script.pdf',
  fileUrl: '/uploads/script.pdf',
  fileSize: 12345,
};

const samplePoll = {
  poll_id: 1,
  poll_question: 'Яку тему обрати?',
  is_active: true,
  options: [],
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('fetch', mockFetch);
});

// ── Products ──────────────────────────────────────────────────────────────────

describe('adminAddProduct', () => {
  const productData = {
    title: 'Сценарій',
    description: 'Опис',
    price: 199,
    typeId: 1,
    ageCategoryIds: [1, 2],
    eventIds: [3],
    hidden: false,
  };

  it('sends multipart form data with Authorization header and returns product', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ success: true, product: sampleProduct }),
    });
    const mainImage = new File(['img'], 'main.jpg', { type: 'image/jpeg' });
    const galleryImage = new File(['img'], 'gallery.jpg', { type: 'image/jpeg' });
    const file = new File(['data'], 'script.pdf', { type: 'application/pdf' });

    const { adminAddProduct } = createAdminMethods(mockClient);
    const result = await adminAddProduct(productData, { mainImage, images: [galleryImage], files: [file] });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(config.endpoints.products),
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer admin-jwt-token' },
      })
    );
    expect(result).toEqual(sampleProduct);
  });

  it('works with minimal attachments (no mainImage, images, or files)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, product: sampleProduct }),
    });

    const { adminAddProduct } = createAdminMethods(mockClient);
    const result = await adminAddProduct(
      { title: 'T', description: 'D', price: 100, typeId: 1 },
      {}
    );

    expect(result).toEqual(sampleProduct);
  });

  it('throws ApiError when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ success: false, error: 'Validation failed' }),
    });

    const { adminAddProduct } = createAdminMethods(mockClient);
    await expect(adminAddProduct(productData, {})).rejects.toBeInstanceOf(ApiError);
  });

  it('throws when response.success is false even with ok status', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: false, error: 'Something wrong' }),
    });

    const { adminAddProduct } = createAdminMethods(mockClient);
    await expect(adminAddProduct(productData, {})).rejects.toBeInstanceOf(ApiError);
  });

  it('throws when response.product is missing', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, product: null }),
    });

    const { adminAddProduct } = createAdminMethods(mockClient);
    await expect(adminAddProduct(productData, {})).rejects.toThrow('Invalid response: missing product');
  });

  it('handles hidden=true product data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, product: sampleProduct }),
    });

    const { adminAddProduct } = createAdminMethods(mockClient);
    await adminAddProduct({ ...productData, hidden: true }, {});

    expect(mockFetch).toHaveBeenCalled();
  });
});

describe('adminUpdateProduct', () => {
  it('sends PUT multipart request and resolves on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { adminUpdateProduct } = createAdminMethods(mockClient);
    await expect(adminUpdateProduct(1, { title: 'Updated Title' })).resolves.toBeUndefined();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/1'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('handles attachments with files, images, removeFileIds, and removeImageUrls', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    const file = new File(['data'], 'file.pdf', { type: 'application/pdf' });
    const image = new File(['img'], 'image.jpg', { type: 'image/jpeg' });

    const { adminUpdateProduct } = createAdminMethods(mockClient);
    await adminUpdateProduct(1, { ageCategoryIds: [1], eventIds: [] }, {
      files: [file],
      images: [image],
      removeFileIds: [5],
      removeImageUrls: ['https://cdn.example.com/old.jpg'],
      removeMainImage: true,
    });

    expect(mockFetch).toHaveBeenCalled();
  });

  it('handles empty ageCategoryIds by appending empty string', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { adminUpdateProduct } = createAdminMethods(mockClient);
    await adminUpdateProduct(1, { ageCategoryIds: [] });

    expect(mockFetch).toHaveBeenCalled();
  });

  it('throws "Product not found" when error includes not found', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ success: false, error: 'Product not found in DB' }),
    });

    const { adminUpdateProduct } = createAdminMethods(mockClient);
    await expect(adminUpdateProduct(999, {})).rejects.toThrow('Product not found');
  });

  it('throws generic error for other failures', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ success: false, error: 'Validation failed' }),
    });

    const { adminUpdateProduct } = createAdminMethods(mockClient);
    await expect(adminUpdateProduct(1, {})).rejects.toThrow('Validation failed');
  });
});

describe('adminGetProductFiles', () => {
  it('returns product files on success', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, files: [sampleFile] });

    const { adminGetProductFiles } = createAdminMethods(mockClient);
    const result = await adminGetProductFiles(1);

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.productFiles(1));
    expect(result).toEqual([sampleFile]);
  });

  it('throws ApiError when response.success is false', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, error: 'Not found', files: [] });

    const { adminGetProductFiles } = createAdminMethods(mockClient);
    await expect(adminGetProductFiles(1)).rejects.toBeInstanceOf(ApiError);
  });
});

describe('adminDeleteProduct', () => {
  it('deletes product successfully', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: true });

    const { adminDeleteProduct } = createAdminMethods(mockClient);
    await expect(adminDeleteProduct(1)).resolves.toBeUndefined();

    expect(mockClient.delete).toHaveBeenCalledWith(`${config.endpoints.products}/1`);
  });

  it('throws "Product not found" when error includes not found', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: false, error: 'Product not found' });

    const { adminDeleteProduct } = createAdminMethods(mockClient);
    await expect(adminDeleteProduct(999)).rejects.toThrow('Product not found');
  });

  it('throws generic error for other delete failures', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: false, error: 'DB error' });

    const { adminDeleteProduct } = createAdminMethods(mockClient);
    await expect(adminDeleteProduct(1)).rejects.toThrow('DB error');
  });

  it('throws with fallback message when no error string', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: false });

    const { adminDeleteProduct } = createAdminMethods(mockClient);
    await expect(adminDeleteProduct(1)).rejects.toThrow('Failed to delete product');
  });
});

// ── Personal Orders (admin) ────────────────────────────────────────────────────

describe('adminCreatePersonalOrder', () => {
  it('creates an order and returns it', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true, personalOrder: sampleOrder });

    const { adminCreatePersonalOrder } = createAdminMethods(mockClient);
    const result = await adminCreatePersonalOrder({
      orderTitle: 'Замовлення',
      orderDescription: 'Опис',
      orderMaterialType: 'Сценарій',
      orderMaterialAgeCategory: 'Дорослі',
    });

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.personalOrders.base,
      expect.objectContaining({ orderTitle: 'Замовлення', orderDeadline: null })
    );
    expect(result).toEqual(sampleOrder);
  });

  it('throws when success is false or personalOrder missing', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: false, error: 'DB error' });

    const { adminCreatePersonalOrder } = createAdminMethods(mockClient);
    await expect(adminCreatePersonalOrder({
      orderTitle: 'T', orderDescription: 'D', orderMaterialType: 'S', orderMaterialAgeCategory: 'A',
    })).rejects.toThrow('DB error');
  });
});

describe('adminGetAllPersonalOrders', () => {
  it('returns all orders on success', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, personalOrders: [sampleOrder] });

    const { adminGetAllPersonalOrders } = createAdminMethods(mockClient);
    const result = await adminGetAllPersonalOrders();

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.personalOrders.all);
    expect(result).toEqual([sampleOrder]);
  });

  it('throws with admin message on 403', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new ApiError('Forbidden', config.httpStatusCodes.FORBIDDEN));

    const { adminGetAllPersonalOrders } = createAdminMethods(mockClient);
    await expect(adminGetAllPersonalOrders()).rejects.toThrow('Admin access required');
  });

  it('throws when success is false', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, error: 'DB error', personalOrders: null });

    const { adminGetAllPersonalOrders } = createAdminMethods(mockClient);
    await expect(adminGetAllPersonalOrders()).rejects.toThrow('DB error');
  });
});

describe('adminGetPersonalOrderById', () => {
  it('returns order on success', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, personalOrder: sampleOrder });

    const { adminGetPersonalOrderById } = createAdminMethods(mockClient);
    const result = await adminGetPersonalOrderById(1);

    expect(result).toEqual(sampleOrder);
  });

  it('throws "Order not found" on 404', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new ApiError('Not found', config.httpStatusCodes.NOT_FOUND));

    const { adminGetPersonalOrderById } = createAdminMethods(mockClient);
    await expect(adminGetPersonalOrderById(999)).rejects.toThrow('Order not found');
  });

  it('throws when success false', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, error: 'Bad', personalOrder: null });

    const { adminGetPersonalOrderById } = createAdminMethods(mockClient);
    await expect(adminGetPersonalOrderById(1)).rejects.toThrow('Bad');
  });
});

describe('adminUpdatePersonalOrder', () => {
  it('updates and returns order on success', async () => {
    vi.mocked(mockClient.put).mockResolvedValue({ success: true, personalOrder: sampleOrder });

    const { adminUpdatePersonalOrder } = createAdminMethods(mockClient);
    const result = await adminUpdatePersonalOrder(1, { orderTitle: 'Updated' });

    expect(mockClient.put).toHaveBeenCalledWith(
      `${config.endpoints.personalOrders.base}/1`,
      { orderTitle: 'Updated' }
    );
    expect(result).toEqual(sampleOrder);
  });

  it('throws "Order not found" when error includes not found', async () => {
    vi.mocked(mockClient.put).mockResolvedValue({ success: false, error: 'Order not found', personalOrder: null });

    const { adminUpdatePersonalOrder } = createAdminMethods(mockClient);
    await expect(adminUpdatePersonalOrder(1, {})).rejects.toThrow('Order not found');
  });

  it('throws generic error for other failures', async () => {
    vi.mocked(mockClient.put).mockResolvedValue({ success: false, error: 'Validation error', personalOrder: null });

    const { adminUpdatePersonalOrder } = createAdminMethods(mockClient);
    await expect(adminUpdatePersonalOrder(1, {})).rejects.toThrow('Validation error');
  });
});

describe('adminDeletePersonalOrder', () => {
  it('deletes order on success', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: true });

    const { adminDeletePersonalOrder } = createAdminMethods(mockClient);
    await expect(adminDeletePersonalOrder(1)).resolves.toBeUndefined();
  });

  it('throws "Order not found" when error includes not found', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: false, error: 'Order not found' });

    const { adminDeletePersonalOrder } = createAdminMethods(mockClient);
    await expect(adminDeletePersonalOrder(1)).rejects.toThrow('Order not found');
  });

  it('throws generic error for other failures', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: false, error: 'DB error' });

    const { adminDeletePersonalOrder } = createAdminMethods(mockClient);
    await expect(adminDeletePersonalOrder(1)).rejects.toThrow('DB error');
  });
});

describe('adminGetPersonalOrderFiles', () => {
  it('returns order files on success', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, files: [sampleFile] });

    const { adminGetPersonalOrderFiles } = createAdminMethods(mockClient);
    const result = await adminGetPersonalOrderFiles(1);

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.personalOrders.files(1));
    expect(result).toEqual([sampleFile]);
  });

  it('throws ApiError when success is false', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, error: 'Not found', files: [] });

    const { adminGetPersonalOrderFiles } = createAdminMethods(mockClient);
    await expect(adminGetPersonalOrderFiles(1)).rejects.toBeInstanceOf(ApiError);
  });
});

describe('adminUploadPersonalOrderFiles', () => {
  it('uploads files via fetch multipart and returns file metadata', async () => {
    const files = [new File(['data'], 'file.pdf', { type: 'application/pdf' })];
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, files: [sampleFile] }),
    });

    const { adminUploadPersonalOrderFiles } = createAdminMethods(mockClient);
    const result = await adminUploadPersonalOrderFiles(1, files);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(config.endpoints.personalOrders.files(1)),
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer admin-jwt-token' },
      })
    );
    expect(result).toEqual([sampleFile]);
  });

  it('returns empty array when response has no files field', async () => {
    const files = [new File(['data'], 'file.pdf', { type: 'application/pdf' })];
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { adminUploadPersonalOrderFiles } = createAdminMethods(mockClient);
    const result = await adminUploadPersonalOrderFiles(1, files);

    expect(result).toEqual([]);
  });

  it('throws ApiError when upload fails', async () => {
    const files = [new File(['data'], 'file.pdf', { type: 'application/pdf' })];
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ success: false, error: 'File too large' }),
    });

    const { adminUploadPersonalOrderFiles } = createAdminMethods(mockClient);
    await expect(adminUploadPersonalOrderFiles(1, files)).rejects.toBeInstanceOf(ApiError);
  });
});

describe('adminDeletePersonalOrderFile', () => {
  it('deletes the file on success', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: true });

    const { adminDeletePersonalOrderFile } = createAdminMethods(mockClient);
    await expect(adminDeletePersonalOrderFile(1, 5)).resolves.toBeUndefined();

    expect(mockClient.delete).toHaveBeenCalledWith(config.endpoints.personalOrders.file(1, 5));
  });

  it('throws ApiError when success is false', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: false, error: 'Not found' });

    const { adminDeletePersonalOrderFile } = createAdminMethods(mockClient);
    await expect(adminDeletePersonalOrderFile(1, 5)).rejects.toBeInstanceOf(ApiError);
  });
});

describe('adminSendPersonalOrderMaterials', () => {
  it('sends materials and resolves on success', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true });

    const { adminSendPersonalOrderMaterials } = createAdminMethods(mockClient);
    await expect(adminSendPersonalOrderMaterials(1)).resolves.toBeUndefined();

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.personalOrders.sendMaterials(1),
      {}
    );
  });

  it('throws ApiError when success is false', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: false, error: 'Send failed' });

    const { adminSendPersonalOrderMaterials } = createAdminMethods(mockClient);
    await expect(adminSendPersonalOrderMaterials(1)).rejects.toBeInstanceOf(ApiError);
  });
});

// ── Analytics ────────────────────────────────────────────────────────────────

describe('getProductAnalytics', () => {
  const sampleAnalytics = { views: 100, purchases: 10, averageRating: 4.5 };

  it('fetches analytics without date range', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, analytics: sampleAnalytics });

    const { getProductAnalytics } = createAdminMethods(mockClient);
    const result = await getProductAnalytics(1);

    expect(mockClient.get).toHaveBeenCalledWith(
      expect.not.stringContaining('?')
    );
    expect(result).toEqual(sampleAnalytics);
  });

  it('fetches analytics with timeFrom and timeTo query params', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, analytics: sampleAnalytics });

    const { getProductAnalytics } = createAdminMethods(mockClient);
    await getProductAnalytics(1, '2024-01-01', '2024-01-31');

    expect(mockClient.get).toHaveBeenCalledWith(
      expect.stringContaining('timeFrom=2024-01-01')
    );
  });

  it('fetches analytics with only timeFrom', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, analytics: sampleAnalytics });

    const { getProductAnalytics } = createAdminMethods(mockClient);
    await getProductAnalytics(1, '2024-01-01');

    expect(mockClient.get).toHaveBeenCalledWith(
      expect.stringContaining('timeFrom=2024-01-01')
    );
  });

  it('throws "Product not found" on 404', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new ApiError('Not found', config.httpStatusCodes.NOT_FOUND));

    const { getProductAnalytics } = createAdminMethods(mockClient);
    await expect(getProductAnalytics(999)).rejects.toThrow('Product not found');
  });

  it('throws when success is false', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, error: 'DB error', analytics: null });

    const { getProductAnalytics } = createAdminMethods(mockClient);
    await expect(getProductAnalytics(1)).rejects.toThrow('DB error');
  });
});

describe('getAnalyticsProducts', () => {
  it('returns analytics product list on success', async () => {
    const products = [{ id: 1, title: 'Сценарій', hidden: false }];
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, products });

    const { getAnalyticsProducts } = createAdminMethods(mockClient);
    const result = await getAnalyticsProducts();

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.analytics.products);
    expect(result).toEqual(products);
  });

  it('throws "Admin access required" on 403', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new ApiError('Forbidden', config.httpStatusCodes.FORBIDDEN));

    const { getAnalyticsProducts } = createAdminMethods(mockClient);
    await expect(getAnalyticsProducts()).rejects.toThrow('Admin access required');
  });

  it('throws when success is false', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, error: 'Error', products: null });

    const { getAnalyticsProducts } = createAdminMethods(mockClient);
    await expect(getAnalyticsProducts()).rejects.toThrow('Error');
  });
});

// ── Polls ─────────────────────────────────────────────────────────────────────

describe('adminCreatePoll', () => {
  it('creates a poll and returns it', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true, poll: samplePoll });

    const { adminCreatePoll } = createAdminMethods(mockClient);
    const result = await adminCreatePoll({ pollQuestion: 'Яку тему?', options: ['Варіант 1'] });

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.polls.base,
      { poll_question: 'Яку тему?', options: ['Варіант 1'] }
    );
    expect(result).toEqual(samplePoll);
  });

  it('throws when success is false or poll missing', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: false, error: 'Failed', poll: null });

    const { adminCreatePoll } = createAdminMethods(mockClient);
    await expect(adminCreatePoll({ pollQuestion: 'Q', options: [] })).rejects.toThrow('Failed');
  });
});

describe('adminSetPollStatus', () => {
  it('updates poll status', async () => {
    vi.mocked(mockClient.put).mockResolvedValue({ success: true });

    const { adminSetPollStatus } = createAdminMethods(mockClient);
    await adminSetPollStatus(1, false);

    expect(mockClient.put).toHaveBeenCalledWith(
      config.endpoints.polls.status(1),
      { is_active: false }
    );
  });

  it('throws "Poll not found" when error includes not found', async () => {
    vi.mocked(mockClient.put).mockResolvedValue({ success: false, error: 'Poll not found' });

    const { adminSetPollStatus } = createAdminMethods(mockClient);
    await expect(adminSetPollStatus(999, true)).rejects.toThrow('Poll not found');
  });

  it('throws generic error for other failures', async () => {
    vi.mocked(mockClient.put).mockResolvedValue({ success: false, error: 'DB error' });

    const { adminSetPollStatus } = createAdminMethods(mockClient);
    await expect(adminSetPollStatus(1, true)).rejects.toThrow('DB error');
  });
});

describe('adminDeletePoll', () => {
  it('deletes poll on success', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: true });

    const { adminDeletePoll } = createAdminMethods(mockClient);
    await expect(adminDeletePoll(1)).resolves.toBeUndefined();

    expect(mockClient.delete).toHaveBeenCalledWith(config.endpoints.polls.delete(1));
  });

  it('throws "Poll not found" when error includes not found', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: false, error: 'Poll not found' });

    const { adminDeletePoll } = createAdminMethods(mockClient);
    await expect(adminDeletePoll(999)).rejects.toThrow('Poll not found');
  });

  it('throws generic error for other failures', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: false, error: 'Delete failed' });

    const { adminDeletePoll } = createAdminMethods(mockClient);
    await expect(adminDeletePoll(1)).rejects.toThrow('Delete failed');
  });
});

describe('adminGetPollResults', () => {
  it('returns poll results on success', async () => {
    const polls = [{ pollId: 1, options: [] }];
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, polls });

    const { adminGetPollResults } = createAdminMethods(mockClient);
    const result = await adminGetPollResults();

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.polls.results);
    expect(result).toEqual(polls);
  });

  it('throws when success is false', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, error: 'Error', polls: null });

    const { adminGetPollResults } = createAdminMethods(mockClient);
    await expect(adminGetPollResults()).rejects.toThrow('Error');
  });
});

// ── Facebook ──────────────────────────────────────────────────────────────────

describe('adminPublishFacebookPost', () => {
  it('sends multipart request with product ID and optional text', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { adminPublishFacebookPost } = createAdminMethods(mockClient);
    await adminPublishFacebookPost(1, { text: 'Check this out!' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(config.endpoints.facebookPost),
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer admin-jwt-token' },
      })
    );
  });

  it('sends with images when provided', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    const img = new File(['data'], 'img.jpg', { type: 'image/jpeg' });

    const { adminPublishFacebookPost } = createAdminMethods(mockClient);
    await adminPublishFacebookPost(1, { images: [img] });

    expect(mockFetch).toHaveBeenCalled();
  });

  it('sends without text when not provided', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { adminPublishFacebookPost } = createAdminMethods(mockClient);
    await adminPublishFacebookPost(1, {});

    expect(mockFetch).toHaveBeenCalled();
  });

  it('throws ApiError when request fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ success: false, error: 'Facebook API error' }),
    });

    const { adminPublishFacebookPost } = createAdminMethods(mockClient);
    await expect(adminPublishFacebookPost(1, {})).rejects.toBeInstanceOf(ApiError);
  });
});
