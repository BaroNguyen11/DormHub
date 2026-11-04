import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ROLE_HOME } from "../constants/roles";
import { AuthLoading } from "@/components/Screen/UIComponents";

export default function AuthRoute() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (user) {
    return <Navigate to={ROLE_HOME[role] || "/"} replace />;
  }

  return <Outlet />;
}
