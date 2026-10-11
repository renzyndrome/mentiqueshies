import { Outlet, createRootRoute } from '@tanstack/react-router';
import { NotFound } from '../components/NotFound';

export const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: NotFound,
});
