import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ROLE_HOME } from '../constants/roles';

export default function ProtectRoute({ role }) {
  const { user, role: current, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-status">Đang xác thực phiên đăng nhập…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (current !== role) {
    return <Navigate to={ROLE_HOME[current] || '/login'} replace />;
  }

  return <Outlet />;
}
