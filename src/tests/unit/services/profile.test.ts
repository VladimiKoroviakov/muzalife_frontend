/**
 * @fileoverview Unit tests for {@link createProfileMethods}.
 *
 * @module tests/unit/services/profile
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProfileMethods } from '@/services/api/profile';
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
  token: 'test-jwt-token',
} as unknown as ApiClient;

const validApiUser = {
  id: 1,
  name: 'Олена Коваль',
  email: 'olena@test.com',
  authProvider: 'email',
  createdAt: '2024-01-01T00:00:00Z',
  avatar_url: 'https://cdn.example.com/avatar.jpg',
  is_admin: false,
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('fetch', mockFetch);
});

describe('getProfile', () => {
  it('fetches profile, validates shape, caches, and returns mapped AuthUser', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ user: validApiUser });

    const { getProfile } = createProfileMethods(mockClient);
    const result = await getProfile();

    expect(mockClient.get).toHaveBeenCalledWith(config.endpoints.users.profile);
    expect(mockCacheManager.setItem).toHaveBeenCalledWith(
      config.cacheKeys.USER_PROFILE,
      expect.objectContaining({ id: 1, name: 'Олена Коваль', auth_provider: 'email' })
    );
    expect(result.id).toBe(1);
    expect(result.name).toBe('Олена Коваль');
    expect(result.auth_provider).toBe('email');
    expect(result.created_at).toBe('2024-01-01T00:00:00Z');
    expect(result.is_admin).toBe(false);
  });

  it('uses undefined for avatar_url when not present in response', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({
      user: { ...validApiUser, avatar_url: null },
    });

    const { getProfile } = createProfileMethods(mockClient);
    const result = await getProfile();

    expect(result.avatar_url).toBeUndefined();
  });

  it('defaults is_admin to false when not present', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({
      user: { ...validApiUser, is_admin: undefined },
    });

    const { getProfile } = createProfileMethods(mockClient);
    const result = await getProfile();

    expect(result.is_admin).toBe(false);
  });

  it('throws when response has no user', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ user: null });

    const { getProfile } = createProfileMethods(mockClient);
    await expect(getProfile()).rejects.toThrow('Invalid profile response: missing user');
  });

  it('throws when user.id is not a number', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({
      user: { ...validApiUser, id: 'not-a-number' },
    });

    const { getProfile } = createProfileMethods(mockClient);
    await expect(getProfile()).rejects.toThrow('Invalid profile response: malformed user object');
  });

  it('throws when user.email is not a string', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({
      user: { ...validApiUser, email: 42 },
    });

    const { getProfile } = createProfileMethods(mockClient);
    await expect(getProfile()).rejects.toThrow('malformed user object');
  });
});

describe('updateName', () => {
  it('calls client.put with name endpoint and updates cache', async () => {
    vi.mocked(mockClient.put).mockResolvedValue(undefined);
    const cachedProfile = { ...validApiUser, auth_provider: 'email', created_at: '' };
    mockCacheManager.getItem.mockReturnValue(cachedProfile);

    const { updateName } = createProfileMethods(mockClient);
    await updateName('Нове Ім\'я');

    expect(mockClient.put).toHaveBeenCalledWith(config.endpoints.users.name, { name: 'Нове Ім\'я' });
    expect(mockCacheManager.setItem).toHaveBeenCalledWith(
      config.cacheKeys.USER_PROFILE,
      expect.objectContaining({ name: 'Нове Ім\'я' })
    );
  });

  it('does not update cache when no cached profile exists', async () => {
    vi.mocked(mockClient.put).mockResolvedValue(undefined);
    mockCacheManager.getItem.mockReturnValue(null);

    const { updateName } = createProfileMethods(mockClient);
    await updateName('New Name');

    expect(mockCacheManager.setItem).not.toHaveBeenCalled();
  });
});

describe('initiateEmailChange', () => {
  it('calls client.post with correct args', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true });

    const { initiateEmailChange } = createProfileMethods(mockClient);
    await initiateEmailChange('new@test.com', 1);

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.users.email.change.initiate,
      { newEmail: 'new@test.com', id: 1 }
    );
  });
});

describe('verifyEmailChange', () => {
  it('calls client.post with verification code and new email', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true });

    const { verifyEmailChange } = createProfileMethods(mockClient);
    await verifyEmailChange('123456', 'new@test.com', 1);

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.users.email.change.verify,
      { newEmail: 'new@test.com', verificationCode: '123456', userId: 1 }
    );
  });
});

describe('resendEmailChangeCode', () => {
  it('calls client.post with email', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true });

    const { resendEmailChangeCode } = createProfileMethods(mockClient);
    await resendEmailChangeCode('user@test.com');

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.users.email.change.resendCode,
      { email: 'user@test.com' }
    );
  });
});

describe('changePassword', () => {
  it('calls client.post with old and new passwords', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true });

    const { changePassword } = createProfileMethods(mockClient);
    await changePassword('oldPass123', 'newPass456');

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.users.password,
      { oldPassword: 'oldPass123', newPassword: 'newPass456' }
    );
  });
});

describe('uploadProfileImage', () => {
  it('sends multipart request with Authorization header and returns imageUrl', async () => {
    const mockFile = new File(['image content'], 'avatar.jpg', { type: 'image/jpeg' });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ imageUrl: 'https://cdn.example.com/new-avatar.jpg' }),
    });
    mockCacheManager.getItem.mockReturnValue(null);

    const { uploadProfileImage } = createProfileMethods(mockClient);
    const result = await uploadProfileImage(mockFile);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(config.endpoints.users.image),
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer test-jwt-token' },
      })
    );
    expect(result).toEqual({ imageUrl: 'https://cdn.example.com/new-avatar.jpg' });
  });

  it('updates cached profile avatar_url when cache exists', async () => {
    const mockFile = new File(['image content'], 'avatar.jpg', { type: 'image/jpeg' });
    const newImageUrl = 'https://cdn.example.com/new-avatar.jpg';
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ imageUrl: newImageUrl }),
    });
    const cachedProfile = { id: 1, name: 'Олена', email: 'olena@test.com', avatar_url: 'old.jpg' };
    mockCacheManager.getItem.mockReturnValue(cachedProfile);

    const { uploadProfileImage } = createProfileMethods(mockClient);
    await uploadProfileImage(mockFile);

    expect(mockCacheManager.setItem).toHaveBeenCalledWith(
      config.cacheKeys.USER_PROFILE,
      expect.objectContaining({ avatar_url: newImageUrl })
    );
  });

  it('throws when upload fails', async () => {
    const mockFile = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' });
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'File too large' }),
    });

    const { uploadProfileImage } = createProfileMethods(mockClient);
    await expect(uploadProfileImage(mockFile)).rejects.toThrow('File too large');
  });

  it('throws generic message when error not in response', async () => {
    const mockFile = new File(['data'], 'avatar.jpg', { type: 'image/jpeg' });
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    const { uploadProfileImage } = createProfileMethods(mockClient);
    await expect(uploadProfileImage(mockFile)).rejects.toThrow('Upload failed');
  });
});

describe('removeProfileImage', () => {
  it('calls client.delete and clears avatar from cache', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue(undefined);
    const cachedProfile = { id: 1, name: 'Олена', avatar_url: 'old.jpg' };
    mockCacheManager.getItem.mockReturnValue(cachedProfile);

    const { removeProfileImage } = createProfileMethods(mockClient);
    await removeProfileImage();

    expect(mockClient.delete).toHaveBeenCalledWith(config.endpoints.users.image);
    expect(mockCacheManager.setItem).toHaveBeenCalledWith(
      config.cacheKeys.USER_PROFILE,
      expect.objectContaining({ avatar_url: undefined })
    );
  });

  it('does not update cache when no cached profile', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue(undefined);
    mockCacheManager.getItem.mockReturnValue(null);

    const { removeProfileImage } = createProfileMethods(mockClient);
    await removeProfileImage();

    expect(mockCacheManager.setItem).not.toHaveBeenCalled();
  });
});

describe('deleteAccount', () => {
  it('deletes account and clears user data', async () => {
    vi.mocked(mockClient.delete).mockResolvedValue(undefined);

    const { deleteAccount } = createProfileMethods(mockClient);
    await deleteAccount();

    expect(mockClient.delete).toHaveBeenCalledWith(config.endpoints.users.account);
    expect(mockClient.clearUserData).toHaveBeenCalledOnce();
  });
});
