import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ROLE_HOME } from '../constants/roles';

export default function AuthRoute() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="page-status">Đang xác thực phiên đăng nhập…</div>;
  }

  if (user) {
    return <Navigate to={ROLE_HOME[role] || '/'} replace />;
  }

  return <Outlet />;
}
