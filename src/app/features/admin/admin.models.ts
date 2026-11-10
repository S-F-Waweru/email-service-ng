import type { SiteRef, UserRole } from '../../core/auth/auth.models';

/** GET /admin/sites item (backend SiteView). Never contains secrets. */
export interface AdminSite {
  id: string;
  name: string;
  recipient: string;
  isActive: boolean;
  cc: string[];
  /** null: global SMTP_FROM. */
  from: string | null;
  /** null: global SMTP server. */
  smtp: {
    host: string;
    port: number | null;
    secure: boolean;
    user: string | null;
    hasPassword: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * SMTP fields for create/update. On update: a field left out keeps its value,
 * null clears it. Clearing smtpHost switches the site back to global SMTP.
 */
export interface SiteSmtpInput {
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpSecure?: boolean;
  smtpUser?: string | null;
  smtpPass?: string | null;
  smtpFrom?: string | null;
}

export interface CreateSiteInput extends SiteSmtpInput {
  id: string;
  name: string;
  recipient: string;
}

export interface UpdateSiteInput extends SiteSmtpInput {
  name?: string;
  recipient?: string;
  isActive?: boolean;
}

export interface CreatedSite {
  site: AdminSite;
  apiKey: string;
}

/** Backend SITE_ID_PATTERN: 2-50 lowercase letters, digits, dashes; no leading dash. */
export const SITE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,49}$/;

/** GET /admin/users item (backend UserView). */
export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  sites: SiteRef[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  fullName: string;
  role: UserRole;
  siteIds: string[];
  password: string;
}

export interface UpdateUserInput {
  fullName?: string;
  role?: UserRole;
  siteIds?: string[];
  isActive?: boolean;
}

/** Backend MIN_PASSWORD_LENGTH. */
export const MIN_PASSWORD_LENGTH = 12;

/** A random password that meets the backend rule, for "Generate". */
export function generatePassword(length = 16): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*-_';
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}
