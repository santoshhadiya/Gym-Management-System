import { Navigate, Outlet } from "react-router-dom";
import { useGlobalContext } from "../context/GlobalContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useGlobalContext();
  //  Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //  Role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  //  Allowed
  return <Outlet />;
};

export default ProtectedRoute;
