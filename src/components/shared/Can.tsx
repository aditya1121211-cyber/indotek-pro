import type { ReactNode } from 'react';
import { useCan } from '../../hooks/useCan';
import type { AppAction, AppModule } from '../../utils/permissions';

type CanProps = {
  module: AppModule;
  action: AppAction;
  children: ReactNode;
};

export function Can({ module, action, children }: CanProps) {
  return useCan(module, action) ? children : null;
}
