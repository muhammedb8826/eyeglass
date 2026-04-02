import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../Breadcrumb";
import Loader from "@/common/Loader";
import ErroPage from "../common/ErroPage";
import {
  useGetPermissionsCatalogQuery,
  useGetPermissionsMatrixQuery,
  useUpdateRolePermissionsMutation,
} from "@/redux/permissions/permissionsApiSlice";
import type { PermissionCatalogEntry } from "@/types/PermissionsType";
import { ADMIN_ROLE } from "@/constants/permissions";
import { toast } from "react-toastify";
import { isFetchBaseQueryError } from "@/types/ErrorType";
import { handleApiError } from "@/utils/errorHandling";

export const PermissionsManagement = () => {
  const {
    data: catalog = [],
    isLoading: catalogLoading,
    isError: catalogError,
  } = useGetPermissionsCatalogQuery();

  const {
    data: matrix = [],
    isLoading: matrixLoading,
    isError: matrixError,
    error: matrixErr,
  } = useGetPermissionsMatrixQuery();

  const [updateRole, { isLoading: saving }] =
    useUpdateRolePermissionsMutation();

  const [selectedRole, setSelectedRole] = useState("");
  const [draftCodes, setDraftCodes] = useState<string[]>([]);
  const [filter, setFilter] = useState("");

  const displayCatalog = useMemo((): PermissionCatalogEntry[] => {
    if (catalog.length) return catalog;
    const set = new Set<string>();
    matrix.forEach((m) => m.codes.forEach((c) => set.add(c)));
    return [...set]
      .sort()
      .map((code) => ({ code, label: code }));
  }, [catalog, matrix]);

  const catalogCodeSet = useMemo(
    () => new Set(displayCatalog.map((c) => c.code)),
    [displayCatalog]
  );

  const sortedRoles = useMemo(() => {
    const roles = matrix.map((m) => m.role);
    const unique = [...new Set(roles)];
    unique.sort((a, b) => {
      if (a === ADMIN_ROLE) return -1;
      if (b === ADMIN_ROLE) return 1;
      return a.localeCompare(b);
    });
    return unique;
  }, [matrix]);

  useEffect(() => {
    if (!sortedRoles.length) return;
    if (!selectedRole || !sortedRoles.includes(selectedRole)) {
      setSelectedRole(
        sortedRoles.find((r) => r !== ADMIN_ROLE) ?? sortedRoles[0]
      );
    }
  }, [sortedRoles, selectedRole]);

  useEffect(() => {
    if (!selectedRole) return;
    const row = matrix.find((r) => r.role === selectedRole);
    setDraftCodes(row ? [...row.codes] : []);
  }, [selectedRole, matrix]);

  const extraCodes = useMemo(
    () => draftCodes.filter((c) => !catalogCodeSet.has(c)),
    [draftCodes, catalogCodeSet]
  );

  const filteredCatalog = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return displayCatalog;
    return displayCatalog.filter(
      (e) =>
        e.code.toLowerCase().includes(q) ||
        e.label.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q))
    );
  }, [displayCatalog, filter]);

  const isAdminSelected = selectedRole === ADMIN_ROLE;

  const handleSave = async () => {
    if (!selectedRole || isAdminSelected) return;
    try {
      await updateRole({
        role: selectedRole,
        codes: [...new Set(draftCodes)].sort(),
      }).unwrap();
      toast.success("Permissions saved for " + selectedRole);
    } catch (e) {
      if (isFetchBaseQueryError(e)) {
        toast.error(handleApiError(e, "Failed to save permissions"));
      } else {
        toast.error("Failed to save permissions");
      }
    }
  };

  const handleDiscard = () => {
    const row = matrix.find((r) => r.role === selectedRole);
    setDraftCodes(row ? [...row.codes] : []);
  };

  const toggleCode = (code: string) => {
    if (isAdminSelected) return;
    setDraftCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const selectAllVisible = () => {
    if (isAdminSelected) return;
    setDraftCodes((prev) => {
      const next = new Set(prev);
      filteredCatalog.forEach((e) => next.add(e.code));
      return [...next];
    });
  };

  const clearVisible = () => {
    if (isAdminSelected) return;
    const visible = new Set(filteredCatalog.map((e) => e.code));
    setDraftCodes((prev) => prev.filter((c) => !visible.has(c)));
  };

  /** Local draft only; click Save to PUT `{ codes: [] }` and clear the role on the API. */
  const clearAllPermissions = () => {
    if (isAdminSelected) return;
    setDraftCodes([]);
  };

  const removeExtra = (code: string) => {
    if (isAdminSelected) return;
    setDraftCodes((prev) => prev.filter((c) => c !== code));
  };

  if (matrixError) {
    return <ErroPage error={matrixErr} />;
  }

  if (matrixLoading || catalogLoading) {
    return <Loader />;
  }

  if (!sortedRoles.length) {
    return (
      <>
        <Breadcrumb pageName="Permissions" />
        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <p className="text-black dark:text-white">
            No roles were returned from the permission matrix. Check that your
            account has <code className="text-primary">permissions.manage</code>{" "}
            and that the API exposes{" "}
            <code className="text-primary">GET /permissions/matrix</code>.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Permissions" />

      {catalogError && (
        <div className="mb-4 rounded-sm border border-meta-6 bg-meta-6/10 px-4 py-3 text-sm text-black dark:text-white">
          Permission catalog could not be loaded. Showing codes gathered from
          the matrix only.
        </div>
      )}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h3 className="font-semibold text-black dark:text-white">
            Role permissions
          </h3>
          <p className="mt-1 text-sm text-bodydark2">
            Choose a role, toggle permission codes, then save. Saving with{" "}
            <span className="font-mono text-xs text-bodydark1">
              {"{ \"codes\": [] }"}
            </span>{" "}
            clears every permission for that role on the server (non-
            <span className="font-medium text-bodydark1">ADMIN</span> only).{" "}
            <span className="font-medium text-bodydark1">ADMIN</span> cannot be
            edited here.
          </p>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-48">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Role
              </label>
              <select
                className="w-full rounded border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {sortedRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isAdminSelected ? (
            <div className="rounded-md bg-gray-2 px-4 py-3 text-sm text-bodydark1 dark:bg-meta-4 dark:text-bodydark2">
              The ADMIN role is a superuser: effective access includes every
              permission. The backend does not store per-permission rows for
              ADMIN.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="search"
                  placeholder="Filter by code or label…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="min-w-48 flex-1 rounded border border-stroke bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
                />
                <button
                  type="button"
                  onClick={selectAllVisible}
                  className="rounded border border-stroke px-3 py-2 text-sm font-medium hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                >
                  Select visible
                </button>
                <button
                  type="button"
                  onClick={clearVisible}
                  className="rounded border border-stroke px-3 py-2 text-sm font-medium hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                >
                  Clear visible
                </button>
                <button
                  type="button"
                  onClick={clearAllPermissions}
                  className="rounded border border-meta-1 px-3 py-2 text-sm font-medium text-meta-1 hover:bg-meta-1/10 dark:hover:bg-meta-1/20"
                >
                  Clear all permissions
                </button>
              </div>

              {!isAdminSelected && draftCodes.length === 0 && (
                <p className="text-sm text-bodydark2">
                  No permissions selected — <strong className="text-bodydark1">Save role</strong>{" "}
                  will send an empty <code className="text-xs text-primary">codes</code> array and
                  remove all permissions for this role.
                </p>
              )}

              {extraCodes.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-black dark:text-white">
                    Codes on this role not in catalog (you can remove before
                    save)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {extraCodes.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => removeExtra(code)}
                        className="rounded-full bg-meta-6/15 px-3 py-1 text-xs font-medium text-meta-6 hover:bg-meta-6/25"
                      >
                        {code} ×
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <ul className="max-h-[min(28rem,55vh)] space-y-2 overflow-y-auto rounded border border-stroke p-3 dark:border-strokedark">
                {filteredCatalog.length === 0 ? (
                  <li className="text-sm text-bodydark2">No matching codes.</li>
                ) : (
                  filteredCatalog.map((entry) => (
                    <li
                      key={entry.code}
                      className="flex items-start gap-3 border-b border-stroke pb-2 last:border-b-0 dark:border-strokedark"
                    >
                      <input
                        id={`perm-${entry.code}`}
                        type="checkbox"
                        className="mt-1"
                        checked={draftCodes.includes(entry.code)}
                        onChange={() => toggleCode(entry.code)}
                      />
                      <label
                        htmlFor={`perm-${entry.code}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        <span className="font-mono text-xs text-primary">
                          {entry.code}
                        </span>
                        <span className="ml-2 text-black dark:text-white">
                          {entry.label}
                        </span>
                        {entry.description && (
                          <span className="mt-0.5 block text-xs text-bodydark2">
                            {entry.description}
                          </span>
                        )}
                      </label>
                    </li>
                  ))
                )}
              </ul>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="rounded bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save role"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleDiscard}
                  className="rounded border border-stroke px-5 py-2 text-sm font-medium hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                >
                  Discard changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
