import { Hono } from 'hono';
import { ANSWER_ERROR_MESSAGES, validateAnswer } from '../../shared/answerValidation';
import type { AppContext } from '../context';
import { fail, ok, parseBody, wantsAnswers } from '../http';
import { answerBodySchema, joinBodySchema } from '../schemas';
import { buildPublicState } from '../state';

const FULL_MESSAGE = 'Capacity reached. Ask the media team to reset.';

export function publicRoutes(ctx: AppContext): Hono {
  const routes = new Hono();

  routes.get('/health', (c) => ok(c, { status: 'up' }));

  routes.get('/state', (c) => ok(c, buildPublicState(ctx.repo, ctx.publicUrl, wantsAnswers(c) ? 'full' : 'lite')));

  routes.post('/join', async (c) => {
    const body = await parseBody(c, joinBodySchema);
    if (!body.ok) return fail(c, 400, body.error);
    if (ctx.repo.join(body.value.deviceToken) === 'full') return fail(c, 503, FULL_MESSAGE);
    ctx.broadcaster.notify();
    return ok(c, { joined: true });
  });

  routes.post('/answer', async (c) => {
    const body = await parseBody(c, answerBodySchema);
    if (!body.ok) return fail(c, 400, body.error);

    const answer = validateAnswer(body.value.text);
    if (!answer.ok) return fail(c, 400, ANSWER_ERROR_MESSAGES[answer.error]);

    if (ctx.repo.getSession().questionStatus !== 'open') return fail(c, 409, 'Question not open.');

    const { deviceToken } = body.value;
    if (!ctx.answerLimiter.allows(deviceToken)) return fail(c, 429, 'Sending too fast. Retry in 2 seconds.');

    if (ctx.repo.upsertAnswer(deviceToken, answer.value) === 'full') return fail(c, 503, FULL_MESSAGE);
    ctx.answerLimiter.record(deviceToken);
    ctx.broadcaster.notify();
    return ok(c, { text: answer.value });
  });

  return routes;
}
