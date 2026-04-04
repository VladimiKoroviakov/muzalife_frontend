/**
 * @fileoverview User profile types: API response shape and normalised client-side data.
 * @module types/user
 */

export interface UserProfileApiResponse {
  user: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
    authProvider: 'email' | 'google' | 'facebook';
    createdAt: string;
    is_admin?: boolean;
  };
}

export interface UserProfileData {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  authProvider: 'email' | 'google' | 'facebook';
  createdAt: string;
  is_admin?: boolean;
}
