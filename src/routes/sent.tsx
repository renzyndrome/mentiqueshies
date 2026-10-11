import { createRoute } from '@tanstack/react-router';
import { SentPage } from '../features/phone/SentPage';
import { rootRoute } from './root';

export const sentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sent',
  component: SentPage,
});
