/** Return an explicitly configured HTTPS origin, or an empty unready value. */
export function configuredSiteOrigin(value) {
  if (typeof value !== 'string' || /[\u0000-\u001f\u007f]/.test(value)) return '';
  const input = value.trim();
  if (!input.startsWith('https://')) return '';
  try {
    const url = new URL(input);
    if (
      url.username || url.password || url.pathname !== '/' ||
      url.search || url.hash
    ) return '';
    return url.origin;
  } catch {
    return '';
  }
}
