import { createRouter } from '@tanstack/react-router';
import { adminRoute } from './routes/admin';
import { answerRoute } from './routes/answer';
import { joinRoute } from './routes/index';
import { rootRoute } from './routes/root';
import { screenRoute } from './routes/screen';
import { sentRoute } from './routes/sent';

const routeTree = rootRoute.addChildren([joinRoute, answerRoute, sentRoute, screenRoute, adminRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
