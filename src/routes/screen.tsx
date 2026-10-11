import { createRoute } from '@tanstack/react-router';
import { ScreenPage } from '../features/screen/ScreenPage';
import { rootRoute } from './root';

export const screenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/screen',
  component: ScreenPage,
});
