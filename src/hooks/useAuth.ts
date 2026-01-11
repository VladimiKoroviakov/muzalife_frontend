import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { AuthState, AuthUser } from '../types';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const authCheckInProgress = useRef(false);
  const authCheckCalled = useRef(false);

  const checkAuth = async () => {
    if (authCheckInProgress.current) return;

    authCheckInProgress.current = true;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const profile: AuthUser = await apiService.getProfile(); 

      setAuthState({
        user: profile,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
    } finally {
      authCheckInProgress.current = false;
    }
  };

  useEffect(() => {
    if (!authCheckCalled.current) {
      authCheckCalled.current = true;
      checkAuth();
    }
  }, []); 

  const mapUser = (user: any): AuthUser => ({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    auth_provider: user.auth_provider,
    created_at: user.created_at,
    is_admin: user.is_admin ?? false,
  });

  const signInWithEmail = async (
    email: string,
    password: string,
    loginType: 'regular' | 'admin' = 'regular'
  ) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { user } = await apiService.login(email, password, loginType);

      setAuthState({
        user: mapUser(user),
        isLoading: false,
        error: null,
      });

      return { error: null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Login failed';

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));

      return { error: message };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string
  ) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await apiService.initiateRegistration(email, password, name);

      return {
        error: null,
        requiresVerification: true,
        email,
        password,
        name,
      };
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';

      // Pending verification is NOT an error UX-wise
      if (
        error?.response?.data?.code === 'PENDING_VERIFICATION'
      ) {
        return {
          error: null,
          requiresVerification: true,
          email,
          password,
          name,
        };
      }

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));

      return { error: message, requiresVerification: false };
    }
  };

  const completeRegistration = async (
    email: string,
    password: string,
    name: string,
    verificationCode: string
  ) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { user } = await apiService.verifyRegistration(
        email,
        password,
        name,
        verificationCode
      );

      setAuthState({
        user: mapUser({
          ...user,
          auth_provider: 'email',
          is_admin: false,
        }),
        isLoading: false,
        error: null,
      });

      return { error: null, user };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));

      return { error: message };
    }
  };

  const signInWithOAuth = async (
    provider: 'google' | 'facebook',
    accessToken: string
  ) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { user } =
        provider === 'google'
          ? await apiService.googleLogin(accessToken)
          : await apiService.facebookLogin(accessToken);

      setAuthState({
        user: mapUser(user),
        isLoading: false,
        error: null,
      });

      return { error: null };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `${provider} login failed`;

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));

      return { error: message };
    }
  };

  const signOut = async () => {
    authCheckCalled.current = false;
    authCheckInProgress.current = false;
    
    await apiService.logout();
    setAuthState({
      user: null,
      isLoading: false,
      error: null,
    });
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const refreshAuth = async () => {
    await checkAuth();
  };

  return {
    ...authState,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    completeRegistration,
    signOut,
    clearError,
    refreshAuth,
    isAuthenticated: !!authState.user,
  };
}