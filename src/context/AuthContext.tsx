import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string, type: 'regular' | 'admin') => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string, name: string, type: 'regular' | 'admin') => Promise<{ error: any }>;
  signInWithOAuth: (provider: 'google' | 'facebook', accessToken: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  clearUserData?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}