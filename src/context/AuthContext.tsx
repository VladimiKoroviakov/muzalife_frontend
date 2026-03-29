/**
 * @fileoverview Authentication React Context.
 *
 * Provides application-wide access to authentication state and actions via
 * React Context.  The context is backed by the {@link useAuth} hook which
 * manages the JWT lifecycle, profile fetching, and sign-in/sign-out flows.
 *
 * **Architecture decision:** a single `AuthProvider` is placed at the root of
 * the component tree (in `main.tsx`).  All components that need auth state
 * call {@link useAuthContext} instead of drilling props.
 *
 * **Component interaction:**
 * - `AuthProvider` → mounts at app root, reads from `useAuth`
 * - `ProtectedRoute` / `PublicRoute` → read `isAuthenticated` from this context
 * - Login / register pages → call `signInWithEmail`, `signUpWithEmail`, etc.
 *
 * @module context/AuthContext
 */

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * Shape of the value provided by {@link AuthContext}.
 *
 * All methods return a `{ error }` object so callers can show error messages
 * without throwing.
 */
interface AuthContextType {
  /** Currently authenticated user, or `null` if not logged in. */
  user: any;
  /** `true` while the initial auth check or a sign-in request is in flight. */
  isLoading: boolean;
  /** Last auth error message, or `null` if there is no error. */
  error: string | null;
  /**
   * Signs in with email and password.
   * @param email     - User's email address.
   * @param password  - Plain-text password.
   * @param type      - `'regular'` for normal users, `'admin'` for admin login.
   */
  signInWithEmail: (email: string, password: string, type: 'regular' | 'admin') => Promise<{ error: any }>;
  /**
   * Initiates email registration (sends OTP to the user's email).
   * @param email    - Desired email address.
   * @param password - Desired password.
   * @param name     - Display name.
   * @returns `{ error }` on failure, or `{ error: null, requiresVerification: true }` when
   *          the user must confirm via OTP before the account is activated.
   */
  signUpWithEmail: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: any; requiresVerification?: boolean }>;
  /**
   * Signs in via Google or Facebook OAuth.
   * @param provider    - `'google'` or `'facebook'`.
   * @param accessToken - OAuth access token obtained from the provider's SDK.
   */
  signInWithOAuth: (provider: 'google' | 'facebook', accessToken: string) => Promise<{ error: any }>;
  /**
   * Completes the two-step email registration by verifying the OTP.
   * Called after a successful {@link signUpWithEmail} that returns `requiresVerification: true`.
   */
  completeRegistration: (
    email: string,
    password: string,
    name: string,
    verificationCode: string
  ) => Promise<{ error: any; user?: any }>;
  /** Signs the current user out and clears local auth state and cache. */
  signOut: () => Promise<void>;
  /** Clears the `error` field without affecting other auth state. */
  clearError: () => void;
  /** `true` when a user is currently authenticated. */
  isAuthenticated: boolean;
  /** Clears all user-related data from local state (used on logout). */
  clearUserData?: () => void;
}

/**
 * React Context that holds the current auth state and actions.
 * Consumers should use {@link useAuthContext} — never `useContext(AuthContext)` directly.
 *
 * @internal
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provides authentication state to the entire component tree.
 *
 * Place this at the root of the application (above the router):
 *
 * ```tsx
 * <AuthProvider>
 *   <BrowserRouter>
 *     <App />
 *   </BrowserRouter>
 * </AuthProvider>
 * ```
 *
 * @param props          - Component props.
 * @param props.children - Child components that will have access to auth context.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook that returns the current {@link AuthContextType} value.
 *
 * Must be called from inside a component that is wrapped by
 * {@link AuthProvider}.  Throws if used outside the provider tree.
 *
 * @returns The auth context value containing state and action functions.
 * @throws {Error} If called outside of an `AuthProvider`.
 *
 * @example
 * function MyComponent() {
 *   const { user, signOut } = useAuthContext();
 *   return <button onClick={signOut}>{user?.name}</button>;
 * }
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
