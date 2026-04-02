import type {
  PermissionCatalogEntry,
  RolePermissionsRow,
} from "@/types/PermissionsType";

/** Normalize `GET /permissions` payloads (array or wrapped lists). */
export function normalizePermissionCatalog(raw: unknown): PermissionCatalogEntry[] {
  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.permissions)) list = o.permissions as unknown[];
    else if (Array.isArray(o.items)) list = o.items;
    else if (Array.isArray(o.codes)) list = o.codes;
    else if (Array.isArray(o.data)) list = o.data as unknown[];
  }

  return list
    .map((item): PermissionCatalogEntry | null => {
      if (typeof item === "string") {
        return { code: item, label: item };
      }
      if (!item || typeof item !== "object") return null;
      const i = item as Record<string, unknown>;
      const code = String(i.code ?? i.name ?? i.id ?? "");
      if (!code) return null;
      const label =
        i.label != null
          ? String(i.label)
          : i.description != null
            ? String(i.description)
            : code;
      return {
        code,
        label,
        description:
          i.description != null && String(i.description) !== label
            ? String(i.description)
            : undefined,
      };
    })
    .filter((e): e is PermissionCatalogEntry => e !== null);
}

/** `GET /permissions/matrix` often returns `{ ROLE_NAME: string[] }` (no wrapper key). */
function isRoleNameToCodesRecord(obj: Record<string, unknown>): boolean {
  const entries = Object.entries(obj);
  if (entries.length === 0) return false;
  return entries.every(
    ([, val]) =>
      Array.isArray(val) &&
      (val as unknown[]).every((x) => typeof x === "string")
  );
}

/** Normalize `GET /permissions/matrix` payloads (record, wrapped, or row array). */
export function normalizePermissionMatrix(raw: unknown): RolePermissionsRow[] {
  if (!raw || typeof raw !== "object") return [];

  if (Array.isArray(raw)) {
    return raw
      .map((row): RolePermissionsRow | null => {
        if (!row || typeof row !== "object") return null;
        const r = row as Record<string, unknown>;
        const role = String(r.role ?? r.name ?? "");
        if (!role) return null;
        const codes = (r.permissions ?? r.codes ?? []) as unknown;
        const list = Array.isArray(codes) ? codes.map(String) : [];
        return { role, codes: [...new Set(list)] };
      })
      .filter((x): x is RolePermissionsRow => x !== null);
  }

  const o = raw as Record<string, unknown>;

  if (isRoleNameToCodesRecord(o)) {
    return Object.entries(o).map(([role, val]) => ({
      role,
      codes: [...new Set((val as string[]).map(String))],
    }));
  }

  if (o.matrix && typeof o.matrix === "object" && !Array.isArray(o.matrix)) {
    return Object.entries(o.matrix as Record<string, unknown>).map(
      ([role, val]) => ({
        role,
        codes: Array.isArray(val) ? val.map(String) : [],
      })
    );
  }

  if (Array.isArray(o.roles)) {
    return normalizePermissionMatrix(o.roles);
  }

  if (o.data && typeof o.data === "object") {
    return normalizePermissionMatrix(o.data);
  }

  return [];
}
