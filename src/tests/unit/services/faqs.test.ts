/**
 * @fileoverview Unit tests for {@link createFaqsMethods}.
 *
 * @module tests/unit/services/faqs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFaqsMethods } from '@/services/api/faqs';
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

const sampleFAQs = [
  { id: 1, question: 'Що таке?', answer: 'Відповідь 1' },
  { id: 2, question: 'Як це?', answer: 'Відповідь 2' },
];

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getFAQs — cache hit', () => {
  it('returns cached FAQs without fetching when cache is valid', async () => {
    mockCacheManager.getItem.mockReturnValue(sampleFAQs);
    mockCacheManager.isCacheValid.mockReturnValue(true);

    const { getFAQs } = createFaqsMethods(mockClient);
    const result = await getFAQs();

    expect(result).toEqual(sampleFAQs);
    expect(mockClient.get).not.toHaveBeenCalled();
  });
});

describe('getFAQs — cache miss', () => {
  it('fetches, caches, and returns FAQs when cache is invalid', async () => {
    mockCacheManager.getItem.mockReturnValue(null);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockResolvedValue({
      success: true,
      data: sampleFAQs,
    });

    const { getFAQs } = createFaqsMethods(mockClient);
    const result = await getFAQs();

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.faqs);
    expect(mockCacheManager.setWithTimestamp).toHaveBeenCalledWith(
      config.cacheKeys.FAQS,
      sampleFAQs
    );
    expect(result).toEqual(sampleFAQs);
  });

  it('fetches when cached data exists but cache is stale', async () => {
    mockCacheManager.getItem.mockReturnValue(sampleFAQs);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, data: [] });

    const { getFAQs } = createFaqsMethods(mockClient);
    await getFAQs();

    expect(mockClient.get).toHaveBeenCalled();
  });

  it('throws when response.success is false and response.error is present', async () => {
    mockCacheManager.getItem.mockReturnValue(null);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockResolvedValue({
      success: false,
      error: 'Server error',
      data: null,
    });

    const { getFAQs } = createFaqsMethods(mockClient);
    await expect(getFAQs()).rejects.toThrow('Server error');
  });

  it('throws with generic message when response.success is false without error', async () => {
    mockCacheManager.getItem.mockReturnValue(null);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, data: [] });

    const { getFAQs } = createFaqsMethods(mockClient);
    await expect(getFAQs()).rejects.toThrow('Failed to fetch FAQs');
  });

  it('returns stale cached data when fetch fails and cache exists', async () => {
    mockCacheManager.getItem.mockReturnValue(sampleFAQs);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockRejectedValue(new Error('Network error'));

    const { getFAQs } = createFaqsMethods(mockClient);
    const result = await getFAQs();

    expect(result).toEqual(sampleFAQs);
  });

  it('rethrows fetch error when no cache exists', async () => {
    mockCacheManager.getItem.mockReturnValue(null);
    mockCacheManager.isCacheValid.mockReturnValue(false);
    vi.mocked(mockClient.get).mockRejectedValue(new Error('Network error'));

    const { getFAQs } = createFaqsMethods(mockClient);
    await expect(getFAQs()).rejects.toThrow('Network error');
  });
});

describe('getFAQById', () => {
  it('fetches and returns a single FAQ by ID', async () => {
    const faq = sampleFAQs[0];
    vi.mocked(mockClient.get).mockResolvedValue({ success: true, data: faq });

    const { getFAQById } = createFaqsMethods(mockClient);
    const result = await getFAQById(1);

    expect(mockClient.get).toHaveBeenCalledWith(`${config.endpoints.faqs}/1`);
    expect(result).toEqual(faq);
  });

  it('throws when FAQ is not found in response', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, error: 'Not found', data: null });

    const { getFAQById } = createFaqsMethods(mockClient);
    await expect(getFAQById(999)).rejects.toThrow('Not found');
  });

  it('throws generic message when success false and no error', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ success: false, data: null });

    const { getFAQById } = createFaqsMethods(mockClient);
    await expect(getFAQById(1)).rejects.toThrow('Failed to fetch FAQ');
  });
});
