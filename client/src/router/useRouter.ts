import { useContext } from 'react';
import { RouterContext } from './context';
import type { RouterContextType } from './context';

export const useRouter = (): RouterContextType => {
  return useContext(RouterContext);
};
