import { createRoute } from '@tanstack/react-router';
import { JoinPage } from '../features/phone/JoinPage';
import { rootRoute } from './root';

export const joinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: JoinPage,
});
