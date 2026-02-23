import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentToken, selectIsLoggedOut } from "@/redux/authSlice";

const RequireAuth = () => {
  const token = useSelector(selectCurrentToken);
  const isLoggedOut = useSelector(selectIsLoggedOut);
  const location = useLocation();
  
  // If user is logged out or no token exists, redirect to signin
  if (isLoggedOut || !token) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
};

export default RequireAuth;
  