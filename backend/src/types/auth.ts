export type UserRole = 'admin' | 'employer' | 'recruiter';
export type PublicRole = UserRole;

export type AuthPayload = {
  id: number;
  email: string;
  role: UserRole;
};
