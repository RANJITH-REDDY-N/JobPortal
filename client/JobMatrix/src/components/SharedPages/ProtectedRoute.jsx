import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem("jwtToken");
  const user = useSelector((state) => state.user.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is defined, ensure user role matches
  if (allowedRoles && !allowedRoles.includes(user?.user_role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
