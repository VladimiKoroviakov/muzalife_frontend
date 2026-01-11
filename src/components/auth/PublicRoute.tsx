// PublicRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#e6e6e6]">
        <div className="text-[#4d4d4d] text-[18px]">Перевірка авторизації...</div>
      </div>
    );
  }

  // If user is already authenticated, redirect them away from public routes
  if (user) {
    // Redirect to the page they were trying to access before, or to cabinet
    const from = location.state?.from?.pathname || '/cabinet';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}