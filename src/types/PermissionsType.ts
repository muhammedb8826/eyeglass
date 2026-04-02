export type PermissionsMeResponse = {
  role: string;
  permissions: string[];
};

export type PermissionCatalogEntry = {
  code: string;
  label: string;
  description?: string;
};

export type RolePermissionsRow = {
  role: string;
  codes: string[];
};
