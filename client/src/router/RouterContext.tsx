import React, { useState, useEffect, useCallback } from 'react';
import { pathToRoute, routeToPath } from './routes';
import type { AppRoute } from './routes';
import { RouterContext } from './context';

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      return pathToRoute(window.location.pathname);
    }
    return 'home';
  });
  const [homeKey, setHomeKey] = useState(0);

  const resetHome = useCallback(() => {
    setRoute('home');
    setHomeKey((k) => k + 1);
    if (typeof window !== 'undefined') {
      const path = routeToPath('home');
      if (window.location.pathname !== path) {
        window.history.pushState({ route: 'home' }, '', path);
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  const navigateTo = useCallback((targetRoute: AppRoute) => {
    setRoute(targetRoute);
    if (targetRoute === 'home') {
      setHomeKey((k) => k + 1);
    }
    if (typeof window !== 'undefined') {
      const path = routeToPath(targetRoute);
      if (window.location.pathname !== path) {
        window.history.pushState({ route: targetRoute }, '', path);
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const newRoute = pathToRoute(window.location.pathname);
      setRoute(newRoute);
      if (newRoute === 'home') {
        setHomeKey((k) => k + 1);
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ route, navigateTo, homeKey, resetHome }}>
      {children}
    </RouterContext.Provider>
  );
};
