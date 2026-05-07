/**
 * @fileoverview Unit tests for {@link createAuthMethods}.
 *
 * @module tests/unit/services/auth
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuthMethods } from '@/services/api/auth';
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

const sampleAuthResponse = {
  token: 'jwt-token-123',
  user: { id: 1, name: 'Олена', email: 'olena@test.com' },
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('initiateRegistration', () => {
  it('calls client.post with registration initiate endpoint and credentials', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true });

    const { initiateRegistration } = createAuthMethods(mockClient);
    await initiateRegistration('user@test.com', 'password123', 'Олена');

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.auth.register.initiate,
      { email: 'user@test.com', password: 'password123', name: 'Олена' }
    );
  });
});

describe('verifyRegistration', () => {
  it('calls client.authRequest with verification endpoint and all credentials', async () => {
    vi.mocked(mockClient.authRequest).mockResolvedValue(sampleAuthResponse);

    const { verifyRegistration } = createAuthMethods(mockClient);
    const result = await verifyRegistration('user@test.com', 'password123', 'Олена', '123456');

    expect(mockClient.authRequest).toHaveBeenCalledWith(
      config.endpoints.auth.register.verify,
      { email: 'user@test.com', password: 'password123', name: 'Олена', verificationCode: '123456' }
    );
    expect(result).toEqual(sampleAuthResponse);
  });
});

describe('resendVerificationCode', () => {
  it('calls client.post with resend endpoint and email', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true });

    const { resendVerificationCode } = createAuthMethods(mockClient);
    await resendVerificationCode('user@test.com');

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.auth.register.resendCode,
      { email: 'user@test.com' }
    );
  });
});

describe('login', () => {
  it('calls client.authRequest with login endpoint and defaults loginType to regular', async () => {
    vi.mocked(mockClient.authRequest).mockResolvedValue(sampleAuthResponse);

    const { login } = createAuthMethods(mockClient);
    await login('user@test.com', 'password123');

    expect(mockClient.authRequest).toHaveBeenCalledWith(
      config.endpoints.auth.login,
      { email: 'user@test.com', password: 'password123', loginType: 'regular' }
    );
  });

  it('passes admin loginType when specified', async () => {
    vi.mocked(mockClient.authRequest).mockResolvedValue(sampleAuthResponse);

    const { login } = createAuthMethods(mockClient);
    await login('admin@test.com', 'adminpass', 'admin');

    expect(mockClient.authRequest).toHaveBeenCalledWith(
      config.endpoints.auth.login,
      { email: 'admin@test.com', password: 'adminpass', loginType: 'admin' }
    );
  });
});

describe('googleLogin', () => {
  it('calls client.authRequest with google endpoint and access token', async () => {
    vi.mocked(mockClient.authRequest).mockResolvedValue(sampleAuthResponse);

    const { googleLogin } = createAuthMethods(mockClient);
    const result = await googleLogin('google-access-token');

    expect(mockClient.authRequest).toHaveBeenCalledWith(
      config.endpoints.auth.google,
      { accessToken: 'google-access-token' }
    );
    expect(result).toEqual(sampleAuthResponse);
  });
});

describe('facebookLogin', () => {
  it('calls client.authRequest with facebook endpoint and access token', async () => {
    vi.mocked(mockClient.authRequest).mockResolvedValue(sampleAuthResponse);

    const { facebookLogin } = createAuthMethods(mockClient);
    const result = await facebookLogin('fb-access-token');

    expect(mockClient.authRequest).toHaveBeenCalledWith(
      config.endpoints.auth.facebook,
      { accessToken: 'fb-access-token' }
    );
    expect(result).toEqual(sampleAuthResponse);
  });
});

describe('logout', () => {
  it('calls client.clearUserData', async () => {
    const { logout } = createAuthMethods(mockClient);
    await logout();

    expect(mockClient.clearUserData).toHaveBeenCalledOnce();
  });
});

describe('initiateGuestVerification', () => {
  it('calls client.post with guest verify initiate endpoint and email', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true });

    const { initiateGuestVerification } = createAuthMethods(mockClient);
    await initiateGuestVerification('guest@test.com');

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.auth.guest.verifyInitiate,
      { email: 'guest@test.com' }
    );
  });
});

describe('confirmGuestEmail', () => {
  it('calls client.post with guest verify confirm endpoint, email and code', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true, token: 'guest-jwt' });

    const { confirmGuestEmail } = createAuthMethods(mockClient);
    const result = await confirmGuestEmail('guest@test.com', '483920');

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.auth.guest.verifyConfirm,
      { email: 'guest@test.com', code: '483920' }
    );
    expect(result).toEqual({ success: true, token: 'guest-jwt' });
  });
});

describe('resendGuestVerification', () => {
  it('calls client.post with guest verify resend endpoint and email', async () => {
    vi.mocked(mockClient.post).mockResolvedValue({ success: true });

    const { resendGuestVerification } = createAuthMethods(mockClient);
    await resendGuestVerification('guest@test.com');

    expect(mockClient.post).toHaveBeenCalledWith(
      config.endpoints.auth.guest.verifyResend,
      { email: 'guest@test.com' }
    );
  });
});
