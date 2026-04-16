import { entrepreneurs, investors } from '../data/users';
import type { Entrepreneur, Investor, User } from '../types';

export function findUserById(id: string, currentUser?: User | null): Entrepreneur | Investor | User | undefined {
  // If the ID matches the current authenticated user, return it
  if (currentUser && currentUser.id === id) {
    return currentUser as any;
  }

  // Otherwise, look in the demo data
  return (
    entrepreneurs.find((u) => u.id === id) ??
    investors.find((u) => u.id === id)
  );
}

export function getUserLabel(id: string, currentUser?: User | null): string {
  const u = findUserById(id, currentUser);
  if (!u) return 'Unknown user';
  if ('startupName' in u && u.startupName) {
    return `${u.name} (${u.startupName})`;
  }
  return u.name;
}
