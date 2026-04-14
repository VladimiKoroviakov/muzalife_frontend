/**
 * @fileoverview Authentication API methods.
 *
 * Covers registration (two-step OTP flow), email/password login,
 * Google and Facebook OAuth login, and logout.
 *
 * @module services/api/auth
 */

import config from '../../config';
import { ApiResponse, AuthResponse } from '../../types';
import { ApiClient } from './client';

/**
 * Creates authentication methods bound to the given HTTP client.
 *
 * @param client - Shared API transport client.
 * @returns Object containing all auth-related API methods.
 * @example
 * ```ts
 * const { login } = createAuthMethods(client);
 * const response = await login('user@example.com', 'password');
 * ```
 */
export function createAuthMethods(client: ApiClient) {
  return {
    async initiateRegistration(email: string, password: string, name: string): Promise<ApiResponse> {
      return client.post<ApiResponse>(config.endpoints.auth.register.initiate, { email, password, name });
    },

    async verifyRegistration(
      email: string,
      password: string,
      name: string,
      verificationCode: string
    ): Promise<AuthResponse> {
      return client.authRequest<AuthResponse>(config.endpoints.auth.register.verify, {
        email, password, name, verificationCode,
      });
    },

    async resendVerificationCode(email: string): Promise<ApiResponse> {
      return client.post<ApiResponse>(config.endpoints.auth.register.resendCode, { email });
    },

    async login(
      email: string,
      password: string,
      loginType: 'regular' | 'admin' = 'regular'
    ): Promise<AuthResponse> {
      return client.authRequest<AuthResponse>(config.endpoints.auth.login, { email, password, loginType });
    },

    async googleLogin(accessToken: string): Promise<AuthResponse> {
      return client.authRequest<AuthResponse>(config.endpoints.auth.google, { accessToken });
    },

    async facebookLogin(accessToken: string): Promise<AuthResponse> {
      return client.authRequest<AuthResponse>(config.endpoints.auth.facebook, { accessToken });
    },

    async logout(): Promise<void> {
      client.clearUserData();
    },

    /**
     * Sends a 6-digit OTP to the given email for guest checkout.
     * No account is created.
     *
     * @param email - The guest's email address.
     * @returns Resolves on success.
     * @example
     * ```ts
     * await apiService.initiateGuestVerification('guest@example.com');
     * ```
     */
    async initiateGuestVerification(email: string): Promise<void> {
      await client.post<ApiResponse>(config.endpoints.auth.guest.verifyInitiate, { email });
    },

    /**
     * Verifies the OTP and returns a short-lived guest JWT (valid 30 min).
     *
     * @param email - The guest's email address.
     * @param code  - The 6-digit verification code.
     * @returns `{ token }` — guest JWT to pass to `initiateCartPayment`.
     * @throws {ApiError} 400 - Invalid or expired code.
     * @example
     * ```ts
     * const { token } = await apiService.confirmGuestEmail('guest@example.com', '483920');
     * ```
     */
    async confirmGuestEmail(email: string, code: string): Promise<{ token: string }> {
      return client.post<{ success: true; token: string }>(
        config.endpoints.auth.guest.verifyConfirm,
        { email, code },
      );
    },

    /**
     * Re-sends a fresh OTP for guest checkout.  Previous code is invalidated.
     *
     * @param email - The guest's email address.
     * @returns Resolves on success.
     * @example
     * ```ts
     * await apiService.resendGuestVerification('guest@example.com');
     * ```
     */
    async resendGuestVerification(email: string): Promise<void> {
      await client.post<ApiResponse>(config.endpoints.auth.guest.verifyResend, { email });
    },
  };
}
