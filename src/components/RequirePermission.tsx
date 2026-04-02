import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "@/common/Loader";
import { RootState } from "@/redux/store";
import { userHasAnyPermission, userHasPermission } from "@/utils/permissions";

const FALLBACK_ROUTE = "/dashboard/profile";

type RequirePermissionProps = {
  children: ReactNode;
} & (
  | { permission: string; anyOf?: never }
  | { anyOf: string[]; permission?: never }
);

const RequirePermission = (props: RequirePermissionProps) => {
  const { children } = props;
  const user = useSelector((s: RootState) => s.auth.user);
  const permissions = useSelector((s: RootState) => s.auth.permissions);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  const allowed =
    "permission" in props && props.permission
      ? userHasPermission(user, permissions, props.permission)
      : userHasAnyPermission(user, permissions, props.anyOf ?? []);

  if (allowed) {
    return <>{children}</>;
  }

  if (permissions === null) {
    return <Loader />;
  }

  return <Navigate to={FALLBACK_ROUTE} replace />;
};

export default RequirePermission;
