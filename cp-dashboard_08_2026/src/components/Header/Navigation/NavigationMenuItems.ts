export interface NavigationMenuItem {
  label: string;
  path: string;
}

export const navigationMenuItems: NavigationMenuItem[] = [
  { label: 'Project Map and Table', path: '/' },
  { label: 'Budget Overview', path: '/budget-overview' },
  // { label: 'Program Performance', path: '/program-performance' },
  { label: 'Initiatives', path: '/initiatives' },
  { label: 'Transit Services', path: '/transit-services' },
];
