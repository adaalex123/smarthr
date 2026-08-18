export type UserRole = 'admin' | 'employer' | 'recruiter' | 'candidate';
export type PublicRole = UserRole;
export type HiringRole = 'employer' | 'recruiter';

export const HIRING_ROLES: HiringRole[] = ['employer', 'recruiter'];

export function isHiringRole(role: string): role is HiringRole {
  return role === 'employer' || role === 'recruiter';
}

export function canonicalizeRole(role: UserRole): UserRole {
  return role === 'employer' ? 'recruiter' : role;
}

export type AuthPayload = {
  id: number;
  email: string;
  role: UserRole;
};
