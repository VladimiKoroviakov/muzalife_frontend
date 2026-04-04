/**
 * @fileoverview Authentication and authorisation types.
 * @module types/auth
 */

import { ReactNode } from 'react';

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  auth_provider: 'email' | 'google' | 'facebook';
  created_at: string;
  is_admin?: boolean;
};

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Envelope returned by all authentication endpoints (login, register, OAuth).
 * All fields are optional because different auth flows return different subsets:
 * - `login` always returns `token` + `user`.
 * - `register/initiate` returns only `success` + `message`.
 * - `register/verify` returns `token` + `user`.
 */
export interface AuthResponse {
  token?: string;
  user?: AuthUser;
  success?: boolean;
  message?: string;
}

export interface LoginResponse extends AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegistrationResponse extends AuthResponse {
  message: string;
  requiresVerification?: boolean;
}

export interface SocialLoginResponse extends AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AuthLogoTitleProps {
  children: ReactNode;
  logoSize?: number;
}
