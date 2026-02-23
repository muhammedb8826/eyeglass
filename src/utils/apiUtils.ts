/**
 * Build full URL for profile image.
 * Backend returns profile as path like /uploads/profile/{filename}.
 * If profile is already a full URL (http/https), returns it as-is.
 */
export function getProfileImageUrl(profile: string | null | undefined): string | null {
  if (!profile || typeof profile !== 'string') return null;
  const trimmed = profile.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const base = import.meta.env.VITE_NEST_BACKEND_URL ?? 'https://api.ianprint.com/api/v1';
  const host = base.replace(/\/api\/v1\/?$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${host}${path}`;
}
