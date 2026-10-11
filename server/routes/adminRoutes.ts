import { Hono } from 'hono';
import { hasVisibleText } from '../../shared/text';
import { adminAuth } from '../auth';
import type { AuthThrottle } from '../authThrottle';
import type { AppContext } from '../context';
import { fail, ok, parseBody } from '../http';
import { toSessionFields } from '../repository';
import { answerIdSchema, answerVisibilitySchema, sessionUpdateSchema } from '../schemas';
import { buildAdminState } from '../state';

export function adminRoutes(ctx: AppContext, adminKey: string, throttle: AuthThrottle): Hono {
  const routes = new Hono();
  const adminState = () => buildAdminState(ctx.repo, ctx.publicUrl);

  routes.use('*', adminAuth(adminKey, throttle));

  routes.get('/state', (c) => ok(c, adminState()));

  routes.put('/session', async (c) => {
    const body = await parseBody(c, sessionUpdateSchema);
    if (!body.ok) return fail(c, 400, body.error);

    const next = { ...toSessionFields(ctx.repo.getSession()), ...body.value };
    if (next.questionStatus === 'open' && !hasVisibleText(next.questionText)) {
      return fail(c, 400, 'Question text required before opening.');
    }

    // Opening a different question deletes the answers. See questionChange.ts.
    ctx.repo.updateSession(next);
    ctx.broadcaster.notify();
    return ok(c, adminState());
  });

  routes.put('/answers/:id', async (c) => {
    const id = answerIdSchema.safeParse(c.req.param('id'));
    if (!id.success) return fail(c, 400, 'Invalid answer id.');
    const body = await parseBody(c, answerVisibilitySchema);
    if (!body.ok) return fail(c, 400, body.error);

    if (!ctx.repo.setAnswerHidden(id.data, body.value.hidden)) return fail(c, 404, 'Answer not found.');
    ctx.broadcaster.notify();
    return ok(c, adminState());
  });

  routes.post('/reset', (c) => {
    ctx.repo.reset();
    ctx.broadcaster.notify();
    return ok(c, adminState());
  });

  return routes;
}
