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
  };
}
