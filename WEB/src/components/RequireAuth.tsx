import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isAdmin, isLoading, checkIsAdminStatus, user } =
    useAuth();
  const location = useLocation();

  useEffect(() => {
    checkIsAdminStatus(user);
  }, [user]);

  if (isLoading) {
    return <div className="text-center text-2xl text-primary  ">Loading...</div>;
  }
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
