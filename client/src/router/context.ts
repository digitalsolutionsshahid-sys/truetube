import { createContext } from 'react';
import type { AppRoute } from './routes';

export interface RouterContextType {
  route: AppRoute;
  navigateTo: (targetRoute: AppRoute) => void;
}

export const RouterContext = createContext<RouterContextType>({
  route: 'home',
  navigateTo: () => {},
});
