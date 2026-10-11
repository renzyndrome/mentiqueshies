import { createRoute } from '@tanstack/react-router';
import { QrPage } from '../features/screen/QrPage';
import { rootRoute } from './root';

export const qrRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/qr',
  component: QrPage,
});
