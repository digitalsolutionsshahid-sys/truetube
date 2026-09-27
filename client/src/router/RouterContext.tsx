import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppRoute, pathToRoute, routeToPath } from './routes';

interface RouterContextType {
  route: AppRoute;
  navigateTo: (targetRoute: AppRoute) => void;
}

const RouterContext = createContext<RouterContextType>({
  route: 'home',
  navigateTo: () => {},
});

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      return pathToRoute(window.location.pathname);
    }
    return 'home';
  });

  const navigateTo = useCallback((targetRoute: AppRoute) => {
    setRoute(targetRoute);
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
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ route, navigateTo }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  return useContext(RouterContext);
};
