import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export function AuthBootScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020208] text-slate-400">
      <Loader2 size={22} className="animate-spin" />
    </div>
  );
}

const ProtectedRoute = ({
  isAuthenticated,
  isLoading = false,
  redirectPath = '/',
  children,
}) => {
  if (isLoading) {
    return <AuthBootScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
