import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Spinner from '@/components/ui/Spinner';

interface ProtectedRouteProps {
  allowedRoles: ('Cliente' | 'Administrador')[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { authState } = useAuth();
  const { isAuthenticated, user, loading } = authState;

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && allowedRoles.includes(user.rol)) {
    return <Outlet />;
  }

  // Redirect if user does not have the required role
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
