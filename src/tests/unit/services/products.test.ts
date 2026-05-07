/**
 * @fileoverview Unit tests for {@link createProductsMethods}.
 *
 * @module tests/unit/services/products
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProductsMethods } from '@/services/api/products';
import type { ApiClient } from '@/services/api/client';
import config from '@/config';

vi.mock('@/utils/cache-manager', () => ({
  CacheManager: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    isCacheValid: vi.fn(),
    setWithTimestamp: vi.fn(),
    clearUserCache: vi.fn(),
  },
}));

import { CacheManager } from '@/utils/cache-manager';

const mockCacheManager = vi.mocked(CacheManager, true);

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

const sampleProducts = [
  { id: 1, title: 'Сценарій на НР', price: 199 },
  { id: 2, title: 'Квест на ДН', price: 299 },
];

const sampleBoughtProducts = [
  { productId: 1, title: 'Сценарій на НР', purchasedAt: '2024-01-01' },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getProducts — cache hit', () => {
  it('returns cached products without fetching when cache is valid', async () => {
    mockCacheManager.getItem.mockReturnValue(sampleProducts);
    mockCacheManager.isCacheValid.mockReturnValue(true);

    const { getProducts } = createProductsMethods(mockClient);
    const result = await getProducts();

    expect(result).toEqual(sampleProducts);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
});

describe('getProducts — cache miss', () => {
  it('fetches and caches products when cache is invalid', async () => {
    mockCacheManager.getItem.mockReturnValue(null);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockResolvedValue(sampleProducts);

    const { getProducts } = createProductsMethods(mockClient);
    const result = await getProducts();

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.products);
    expect(mockCacheManager.setWithTimestamp).toHaveBeenCalledWith(config.cacheKeys.PRODUCTS, sampleProducts);
    expect(result).toEqual(sampleProducts);
  });

  it('returns stale cache when fetch fails and cache exists', async () => {
    mockCacheManager.getItem.mockReturnValue(sampleProducts);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockRejectedValue(new Error('Network error'));

    const { getProducts } = createProductsMethods(mockClient);
    const result = await getProducts();

    expect(result).toEqual(sampleProducts);
  });

  it('rethrows fetch error when no cache exists', async () => {
    mockCacheManager.getItem.mockReturnValue(null);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockRejectedValue(new Error('Network error'));

    const { getProducts } = createProductsMethods(mockClient);
    await expect(getProducts()).rejects.toThrow('Network error');
  });
});

describe('getProductById', () => {
  it('fetches a product by ID', async () => {
    vi.mocked(mockClient.get).mockResolvedValue(sampleProducts[0]);

    const { getProductById } = createProductsMethods(mockClient);
    const result = await getProductById('1');

    expect(mockClient.get).toHaveBeenCalledWith(`${config.endpoints.products}/1`);
    expect(result).toEqual(sampleProducts[0]);
  });
});

describe('getSavedProducts — cache hit', () => {
  it('returns cached saved product IDs without fetching', async () => {
    mockCacheManager.getItem.mockReturnValue([1, 2, 3]);

    const { getSavedProducts } = createProductsMethods(mockClient);
    const result = await getSavedProducts();

    expect(result).toEqual([1, 2, 3]);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
});

describe('getSavedProducts — cache miss', () => {
  it('fetches and caches saved product IDs', async () => {
    mockCacheManager.getItem.mockReturnValue(null);
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, data: [1, 2] });

    const { getSavedProducts } = createProductsMethods(mockClient);
    const result = await getSavedProducts();

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.savedProducts.ids);
    expect(mockCacheManager.setItem).toHaveBeenCalledWith(config.cacheKeys.SAVED_PRODUCTS, [1, 2]);
    expect(result).toEqual([1, 2]);
  });

  it('throws when response format is invalid', async () => {
    mockCacheManager.getItem.mockReturnValue(null);
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, error: 'Bad format', data: null });

    const { getSavedProducts } = createProductsMethods(mockClient);
    const result = await getSavedProducts();

    expect(result).toEqual([]);
  });

  it('returns empty array on fetch error when no cache', async () => {
    mockCacheManager.getItem.mockReturnValue(null);
    vi.mocked(mockClient.get).mockRejectedValue(new Error('Network error'));

    const { getSavedProducts } = createProductsMethods(mockClient);
    const result = await getSavedProducts();

    expect(result).toEqual([]);
  });
});

describe('saveProduct', () => {
  it('posts to save product endpoint and updates the cached array', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true });

    const { saveProduct } = createProductsMethods(mockClient);
    await saveProduct(42);

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.savedProducts.base,
      { productId: 42 }
    );
    expect(mockClient.updateCachedArray).toHaveBeenCalledWith(
      config.cacheKeys.SAVED_PRODUCTS,
      42,
      'add'
    );
  });

  it('throws when response.success is false', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: false, error: 'Failed to save' });

    const { saveProduct } = createProductsMethods(mockClient);
    await expect(saveProduct(42)).rejects.toThrow('Failed to save');
  });
});

describe('unsaveProduct', () => {
  it('deletes saved product and removes from cached array', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: true });

    const { unsaveProduct } = createProductsMethods(mockClient);
    await unsaveProduct(42);

    expect(mockClient.delete).toHaveBeenCalledWith(
      `${config.endpoints.savedProducts.base}/42`
    );
    expect(mockClient.updateCachedArray).toHaveBeenCalledWith(
      config.cacheKeys.SAVED_PRODUCTS,
      42,
      'remove'
    );
  });

  it('throws when response.success is false', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue({ success: false, error: 'Failed' });

    const { unsaveProduct } = createProductsMethods(mockClient);
    await expect(unsaveProduct(42)).rejects.toThrow('Failed');
  });
});

describe('getBoughtProducts — cache hit', () => {
  it('returns cached bought products when cache is valid', async () => {
    mockCacheManager.getItem.mockReturnValue(sampleBoughtProducts);

    const { getBoughtProducts } = createProductsMethods(mockClient);
    const result = await getBoughtProducts();

    expect(result).toEqual(sampleBoughtProducts);
    expect(mockClient.get).not.toHaveBeenCalled();
  });

  it('removes invalid cache and fetches fresh data', async () => {
    mockCacheManager.getItem.mockReturnValue([42]);
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, data: sampleBoughtProducts });

    const { getBoughtProducts } = createProductsMethods(mockClient);
    const result = await getBoughtProducts();

    expect(mockCacheManager.removeItem).toHaveBeenCalledWith(config.cacheKeys.BOUGHT_PRODUCTS);
    expect(result).toEqual(sampleBoughtProducts);
  });

  it('handles empty array as valid cache', async () => {
    mockCacheManager.getItem.mockReturnValue([]);

    const { getBoughtProducts } = createProductsMethods(mockClient);
    const result = await getBoughtProducts();

    expect(result).toEqual([]);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
});

describe('getBoughtProducts — cache miss', () => {
  it('fetches and caches bought products', async () => {
    mockCacheManager.getItem.mockReturnValue(null);
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, data: sampleBoughtProducts });

    const { getBoughtProducts } = createProductsMethods(mockClient);
    const result = await getBoughtProducts();

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.boughtProducts.base);
    expect(mockCacheManager.setItem).toHaveBeenCalledWith(
      config.cacheKeys.BOUGHT_PRODUCTS,
      sampleBoughtProducts
    );
    expect(result).toEqual(sampleBoughtProducts);
  });

  it('returns empty array on error when no cache', async () => {
    mockCacheManager.getItem.mockReturnValue(null);
    vi.mocked(mockClient.get).mockRejectedValue(new Error('Network error'));

    const { getBoughtProducts } = createProductsMethods(mockClient);
    const result = await getBoughtProducts();

    expect(result).toEqual([]);
  });
});

describe('buyProduct', () => {
  it('posts to buy product endpoint and removes cache', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true });

    const { buyProduct } = createProductsMethods(mockClient);
    await buyProduct(42);

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.boughtProducts.base,
      { productId: 42 }
    );
    expect(mockCacheManager.removeItem).toHaveBeenCalledWith(config.cacheKeys.BOUGHT_PRODUCTS);
  });

  it('throws when response.success is false', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: false, error: 'Purchase failed' });

    const { buyProduct } = createProductsMethods(mockClient);
    await expect(buyProduct(42)).rejects.toThrow('Purchase failed');
  });
});

describe('resendProductMaterials', () => {
  it('posts to send materials endpoint', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true });

    const { resendProductMaterials } = createProductsMethods(mockClient);
    await resendProductMaterials(42);

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.boughtProducts.sendMaterials(42),
      {}
    );
  });

  it('throws when response.success is false', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: false, error: 'Send failed' });

    const { resendProductMaterials } = createProductsMethods(mockClient);
    await expect(resendProductMaterials(42)).rejects.toThrow('Send failed');
  });
});

describe('getProductTypes', () => {
  it('returns cached types when cache is valid', async () => {
    const types = [{ id: 1, name: 'Сценарій' }];
    mockCacheManager.getItem.mockReturnValue(types);
    mockCacheManager.isCacheValid.mockReturnValue(true);

    const { getProductTypes } = createProductsMethods(mockClient);
    const result = await getProductTypes();

    expect(result).toEqual(types);
    expect(mockClient.get).not.toHaveBeenCalled();
  });

  it('fetches and caches types when cache is stale', async () => {
    const types = [{ id: 1, name: 'Сценарій' }];
    mockCacheManager.getItem.mockReturnValue(null);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, data: types });

    const { getProductTypes } = createProductsMethods(mockClient);
    const result = await getProductTypes();

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.productTypes);
    expect(mockCacheManager.setWithTimestamp).toHaveBeenCalledWith(config.cacheKeys.PRODUCT_TYPES, types);
    expect(result).toEqual(types);
  });

  it('returns stale cache on fetch error', async () => {
    const staleTypes = [{ id: 1, name: 'Старий тип' }];
    mockCacheManager.getItem.mockReturnValue(staleTypes);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockRejectedValue(new Error('Network error'));

    const { getProductTypes } = createProductsMethods(mockClient);
    const result = await getProductTypes();

    expect(result).toEqual(staleTypes);
  });

  it('rethrows error when no stale cache exists', async () => {
    mockCacheManager.getItem.mockReturnValue(null);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockRejectedValue(new Error('Network error'));

    const { getProductTypes } = createProductsMethods(mockClient);
    await expect(getProductTypes()).rejects.toThrow('Network error');
  });
});

describe('getAgeCategories', () => {
  it('returns cached categories when valid', async () => {
    const categories = [{ id: 1, name: 'Дорослі' }];
    mockCacheManager.getItem.mockReturnValue(categories);
    mockCacheManager.isCacheValid.mockReturnValue(true);

    const { getAgeCategories } = createProductsMethods(mockClient);
    const result = await getAgeCategories();

    expect(result).toEqual(categories);
  });

  it('fetches categories when cache is stale', async () => {
    const categories = [{ id: 1, name: 'Дорослі' }];
    mockCacheManager.getItem.mockReturnValue(null);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, data: categories });

    const { getAgeCategories } = createProductsMethods(mockClient);
    const result = await getAgeCategories();

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.productAgeCategories);
    expect(result).toEqual(categories);
  });

  it('returns stale cache on error', async () => {
    const stale = [{ id: 1, name: 'Дорослі' }];
    mockCacheManager.getItem.mockReturnValue(stale);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockRejectedValue(new Error('Network error'));

    const { getAgeCategories } = createProductsMethods(mockClient);
    const result = await getAgeCategories();

    expect(result).toEqual(stale);
  });

  it('rethrows when no cache and fetch fails', async () => {
    mockCacheManager.getItem.mockReturnValue(null);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockRejectedValue(new Error('Fail'));

    const { getAgeCategories } = createProductsMethods(mockClient);
    await expect(getAgeCategories()).rejects.toThrow('Fail');
  });
});

describe('getEvents', () => {
  it('returns cached events when valid', async () => {
    const events = [{ id: 1, name: 'Новий рік' }];
    mockCacheManager.getItem.mockReturnValue(events);
    mockCacheManager.isCacheValid.mockReturnValue(true);

    const { getEvents } = createProductsMethods(mockClient);
    const result = await getEvents();

    expect(result).toEqual(events);
  });

  it('fetches events when cache is stale', async () => {
    const events = [{ id: 1, name: 'Новий рік' }];
    mockCacheManager.getItem.mockReturnValue(null);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, data: events });

    const { getEvents } = createProductsMethods(mockClient);
    const result = await getEvents();

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.productEvents);
    expect(result).toEqual(events);
  });

  it('returns stale cache on error', async () => {
    const stale = [{ id: 1, name: 'Новий рік' }];
    mockCacheManager.getItem.mockReturnValue(stale);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockRejectedValue(new Error('Network error'));

    const { getEvents } = createProductsMethods(mockClient);
    const result = await getEvents();

    expect(result).toEqual(stale);
  });

  it('rethrows when no cache and fetch fails', async () => {
    mockCacheManager.getItem.mockReturnValue(null);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockRejectedValue(new Error('Fail'));

    const { getEvents } = createProductsMethods(mockClient);
    await expect(getEvents()).rejects.toThrow('Fail');
  });
});
