export function isFresh(cachedAt: string | null, latestCheckin: string | null): boolean {
  if (!cachedAt) return false;
  if (!latestCheckin) return true;
  return Date.parse(cachedAt) >= Date.parse(latestCheckin);
}
