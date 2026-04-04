/**
 * @fileoverview User profile API methods.
 *
 * Covers reading and updating profile data (name, email, password,
 * avatar), and account deletion.
 *
 * @module services/api/profile
 */

import config from '../../config';
import { CacheManager } from '../../utils/cache-manager';
import { ApiResponse, AuthUser, UserProfileApiResponse } from '../../types';
import { ApiClient } from './client';

/**
 * Creates user-profile methods bound to the given HTTP client.
 *
 * @param client - Shared API transport client.
 * @returns Object containing all profile-related API methods.
 * @example
 * ```ts
 * const { getProfile } = createProfileMethods(client);
 * const user = await getProfile();
 * ```
 */
export function createProfileMethods(client: ApiClient) {
  return {
    async getProfile(): Promise<AuthUser> {
      const response = await client.get<UserProfileApiResponse>(config.endpoints.users.profile);

      if (!response || !response.user) {
        throw new Error('Invalid profile response: missing user');
      }

      const user = response.user;

      if (
        typeof user.id !== 'number' ||
        typeof user.name !== 'string' ||
        typeof user.email !== 'string' ||
        typeof user.authProvider !== 'string' ||
        typeof user.createdAt !== 'string'
      ) {
        throw new Error('Invalid profile response: malformed user object');
      }

      const profile: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url || undefined,
        auth_provider: user.authProvider,
        created_at: user.createdAt,
        is_admin: user.is_admin ?? false,
      };

      CacheManager.setItem(config.cacheKeys.USER_PROFILE, profile);
      return profile;
    },

    async updateName(name: string): Promise<void> {
      await client.put(config.endpoints.users.name, { name });

      const cachedProfile = CacheManager.getItem<AuthUser>(config.cacheKeys.USER_PROFILE);
      if (cachedProfile) {
        cachedProfile.name = name;
        CacheManager.setItem(config.cacheKeys.USER_PROFILE, cachedProfile);
      }
    },

    async initiateEmailChange(newEmail: string, id: number): Promise<ApiResponse> {
      return client.post<ApiResponse>(config.endpoints.users.email.change.initiate, { newEmail, id });
    },

    async verifyEmailChange(
      verificationCode: string,
      newEmail: string,
      userId: number
    ): Promise<ApiResponse> {
      return client.post<ApiResponse>(config.endpoints.users.email.change.verify, {
        newEmail, verificationCode, userId,
      });
    },

    async resendEmailChangeCode(email: string): Promise<ApiResponse> {
      return client.post<ApiResponse>(config.endpoints.users.email.change.resendCode, { email });
    },

    async changePassword(oldPassword: string, newPassword: string): Promise<void> {
      await client.post(config.endpoints.users.password, { oldPassword, newPassword });
    },

    async uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${config.apiUrl}${config.endpoints.users.image}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${client.token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      const cachedProfile = CacheManager.getItem<AuthUser>(config.cacheKeys.USER_PROFILE);
      if (cachedProfile) {
        cachedProfile.avatar_url = data.imageUrl;
        CacheManager.setItem(config.cacheKeys.USER_PROFILE, cachedProfile);
      }

      return data;
    },

    async removeProfileImage(): Promise<void> {
      await client.delete(config.endpoints.users.image);

      const cachedProfile = CacheManager.getItem<AuthUser>(config.cacheKeys.USER_PROFILE);
      if (cachedProfile) {
        cachedProfile.avatar_url = undefined;
        CacheManager.setItem(config.cacheKeys.USER_PROFILE, cachedProfile);
      }
    },

    async deleteAccount(): Promise<void> {
      await client.delete(config.endpoints.users.account);
      client.clearUserData();
    },
  };
}
