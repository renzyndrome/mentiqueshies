import { createRoute } from '@tanstack/react-router';
import { AdminPage } from '../features/admin/AdminPage';
import { rootRoute } from './root';

export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});
