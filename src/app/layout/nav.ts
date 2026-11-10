export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
  superAdminOnly?: boolean;
}

/** Sidebar navigation. Icons must also be registered in app-shell.ts. */
export const NAV: NavGroup[] = [
  {
    label: 'Inbox',
    items: [{ label: 'Requests', path: '/requests', icon: 'lucideInbox' }],
  },
  {
    label: 'Settings',
    items: [{ label: 'Companies', path: '/companies', icon: 'lucideBuilding2' }],
  },
  {
    label: 'Administration',
    superAdminOnly: true,
    items: [
      { label: 'Sites', path: '/admin/sites', icon: 'lucideGlobe' },
      { label: 'Users', path: '/admin/users', icon: 'lucideUsers' },
    ],
  },
];
