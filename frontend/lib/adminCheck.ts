// lib/adminCheck.ts


export function isAdmin(role?: number) {
  return typeof role === 'number' && role >= 4;
}
