import { entrepreneurs, investors } from '../data/users';
import type { Entrepreneur, Investor } from '../types';

export function findUserById(id: string): Entrepreneur | Investor | undefined {
  return (
    entrepreneurs.find((u) => u.id === id) ??
    investors.find((u) => u.id === id)
  );
}

export function getUserLabel(id: string): string {
  const u = findUserById(id);
  if (!u) return 'Unknown user';
  if (u.role === 'entrepreneur') {
    return `${u.name} (${u.startupName})`;
  }
  return u.name;
}
