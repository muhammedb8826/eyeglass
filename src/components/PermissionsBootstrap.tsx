import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearPermissions,
  selectCurrentToken,
  setPermissions,
} from "@/redux/authSlice";
import { useGetPermissionsMeQuery } from "@/redux/permissions/permissionsApiSlice";

/**
 * Fetches `GET /permissions/me` once per authenticated dashboard session and mirrors codes into Redux.
 */
const PermissionsBootstrap = () => {
  const token = useSelector(selectCurrentToken);
  const dispatch = useDispatch();
  const { data, isSuccess, isError } = useGetPermissionsMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (!token) {
      dispatch(clearPermissions());
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (!token) return;
    if (isSuccess && data) {
      dispatch(setPermissions(data.permissions));
    }
    if (isError) {
      dispatch(setPermissions([]));
    }
  }, [token, data, isSuccess, isError, dispatch]);

  return null;
};

export default PermissionsBootstrap;
