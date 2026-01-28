export function toUtcNoon(d) {
  const x = new Date(d);
  x.setUTCHours(12,0,0,0);
  return x;
}
export function diffNights(checkIn, checkOut) {
  const a = toUtcNoon(checkIn);
  const b = toUtcNoon(checkOut);
  const MS = 86_400_000;
  return Math.round((b - a) / MS);
}