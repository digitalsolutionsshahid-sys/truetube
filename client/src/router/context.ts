import { createContext } from 'react';
import type { AppRoute } from './routes';

export interface RouterContextType {
  route: AppRoute;
  navigateTo: (targetRoute: AppRoute) => void;
  homeKey: number;
  resetHome: () => void;
}

export const RouterContext = createContext<RouterContextType>({
  route: 'home',
  navigateTo: () => {},
  homeKey: 0,
  resetHome: () => {},
});
