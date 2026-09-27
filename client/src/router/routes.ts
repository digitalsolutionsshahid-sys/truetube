export type AppRoute = 'home' | 'features' | 'faq' | 'about';

export const ROUTE_PATHS: Record<AppRoute, string> = {
  home: '/',
  features: '/features',
  faq: '/faq',
  about: '/about',
};

export const PATH_TO_ROUTE: Record<string, AppRoute> = {
  '/': 'home',
  '/features': 'features',
  '/faq': 'faq',
  '/about': 'about',
};

export function pathToRoute(pathname: string): AppRoute {
  // Normalize pathname by stripping trailing slashes
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean in PATH_TO_ROUTE) {
    return PATH_TO_ROUTE[clean];
  }
  // Check hash fallback (e.g. #/about or #about)
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (hash === 'features') return 'features';
  if (hash === 'faq') return 'faq';
  if (hash === 'about') return 'about';
  return 'home';
}

export function routeToPath(route: AppRoute): string {
  return ROUTE_PATHS[route] || '/';
}
