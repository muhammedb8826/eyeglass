import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "@/common/Loader";
import { RootState } from "@/redux/store";
import { userHasPermission } from "@/utils/permissions";

type RequirePermissionProps = {
  permission: string;
  children: ReactNode;
};

const RequirePermission = ({ permission, children }: RequirePermissionProps) => {
  const user = useSelector((s: RootState) => s.auth.user);
  const permissions = useSelector((s: RootState) => s.auth.permissions);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (userHasPermission(user, permissions, permission)) {
    return <>{children}</>;
  }

  if (permissions === null) {
    return <Loader />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default RequirePermission;
