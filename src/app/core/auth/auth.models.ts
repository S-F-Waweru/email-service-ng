export type UserRole = 'company_user' | 'super_admin';

export interface SiteRef {
  id: string;
  name: string;
}

/** GET /auth/me and the `user` in the login response. */
export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  /** Companies this user can switch between (all of them for super-admins). */
  sites: SiteRef[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  /** Seconds. */
  expiresIn: number;
  user: CurrentUser;
}
