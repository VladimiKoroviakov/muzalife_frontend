/**
 * @fileoverview Unit tests for the {@link useAuth} hook.
 *
 * Covers the full auth lifecycle: JWT check on mount, email sign-in (success
 * and failure), admin login type, OAuth, sign-out, and OTP registration.
 *
 * @module tests/unit/hooks/useAuth
 */

// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';

vi.mock('@/services/api', () => ({
  apiService: {
    getProfile: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    initiateRegistration: vi.fn(),
    verifyRegistration: vi.fn(),
    googleLogin: vi.fn(),
    facebookLogin: vi.fn(),
  },
}));

const mockGetProfile = vi.mocked(apiService.getProfile);
const mockLogin = vi.mocked(apiService.login);
const mockLogout = vi.mocked(apiService.logout);
const mockGoogleLogin = vi.mocked(apiService.googleLogin);
const mockVerifyRegistration = vi.mocked(apiService.verifyRegistration);

const fakeUser = {
  id: 42,
  email: 'user@muzalife.com',
  name: 'Тест Юзер',
  avatar_url: undefined,
  auth_provider: 'email' as const,
  created_at: '2025-01-01T00:00:00.000Z',
  is_admin: false,
};

const fakeAdminUser = { ...fakeUser, id: 1, is_admin: true };

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
// Mount check — no token
// ─────────────────────────────────────────────────────────────────────────────
describe('useAuth — mount with no stored token', () => {
  it('resolves immediately without calling getProfile and leaves user null', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetProfile).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Mount check — valid token
// ─────────────────────────────────────────────────────────────────────────────
describe('useAuth — mount with a stored token', () => {
  it('calls getProfile and sets user from the response', async () => {
    localStorage.setItem('authToken', 'valid.jwt.token');
    mockGetProfile.mockResolvedValueOnce(fakeUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetProfile).toHaveBeenCalledTimes(1);
    expect(result.current.user?.email).toBe('user@muzalife.com');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears the token and keeps user null when getProfile rejects (expired token)', async () => {
    localStorage.setItem('authToken', 'expired.jwt');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetProfile.mockRejectedValueOnce(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
    consoleSpy.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// signInWithEmail
// ─────────────────────────────────────────────────────────────────────────────
describe('useAuth — signInWithEmail', () => {
  it('sets user and returns { error: null } on success', async () => {
    mockGetProfile.mockResolvedValueOnce(null as any); // mount check — no token
    mockLogin.mockResolvedValueOnce({ token: 'tok', user: fakeUser });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let response: { error: string | null };
    await act(async () => {
      response = await result.current.signInWithEmail('user@muzalife.com', 'pass123');
    });

    expect(response!.error).toBeNull();
    expect(result.current.user?.id).toBe(42);
  });

  it('sets error state and returns { error } on failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let response: { error: string | null };
    await act(async () => {
      response = await result.current.signInWithEmail('bad@email.com', 'wrong');
    });

    expect(response!.error).toBe('Invalid credentials');
    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.user).toBeNull();
  });

  it('passes loginType "admin" to apiService.login for admin login', async () => {
    mockLogin.mockResolvedValueOnce({ token: 'tok', user: fakeAdminUser });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signInWithEmail('admin@muzalife.com', 'adminpass', 'admin');
    });

    expect(mockLogin).toHaveBeenCalledWith('admin@muzalife.com', 'adminpass', 'admin');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// signOut
// ─────────────────────────────────────────────────────────────────────────────
describe('useAuth — signOut', () => {
  it('clears user state after a successful sign-out', async () => {
    localStorage.setItem('authToken', 'tok');
    mockGetProfile.mockResolvedValueOnce(fakeUser);
    mockLogout.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).not.toBeNull();

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OAuth — Google
// ─────────────────────────────────────────────────────────────────────────────
describe('useAuth — signInWithOAuth (Google)', () => {
  it('sets user from googleLogin response', async () => {
    mockGoogleLogin.mockResolvedValueOnce({ token: 'google.tok', user: fakeUser });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let response: { error: string | null };
    await act(async () => {
      response = await result.current.signInWithOAuth('google', 'google-access-token');
    });

    expect(response!.error).toBeNull();
    expect(result.current.user?.email).toBe('user@muzalife.com');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OTP registration — completeRegistration
// ─────────────────────────────────────────────────────────────────────────────
describe('useAuth — completeRegistration', () => {
  it('sets user and returns { error: null } when OTP verification succeeds', async () => {
    mockVerifyRegistration.mockResolvedValueOnce({ token: 'tok', user: fakeUser });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let response: { error: string | null; user?: typeof fakeUser };
    await act(async () => {
      response = await result.current.completeRegistration(
        'user@muzalife.com',
        'pass123',
        'Тест Юзер',
        '123456'
      );
    });

    expect(response!.error).toBeNull();
    expect(result.current.user?.email).toBe('user@muzalife.com');
  });
});
