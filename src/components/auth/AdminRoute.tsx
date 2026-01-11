// components/auth/AdminRoute.tsx
import { useAuthContext } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Перевірка доступу...</div>
      </div>
    );
  }

  // If not authenticated, redirect to admin login
  if (!isAuthenticated) {
    return <Navigate to="/adminlogin" replace />;
  }

  // If authenticated but not admin, redirect to user cabinet
  if (!user?.is_admin) {
    return <Navigate to="/cabinet" replace />;
  }

  // User is authenticated and is admin, render children
  return <>{children}</>;
}