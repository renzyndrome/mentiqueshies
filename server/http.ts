import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type * as z from 'zod';

export const ok = <T>(c: Context, data: T) => c.json({ ok: true as const, data }, 200);

export const fail = (c: Context, status: ContentfulStatusCode, error: string) =>
  c.json({ ok: false as const, error }, status);

const INVALID_BODY = 'Invalid request body.';

/** Reads and validates a JSON body. Custom refinement messages pass through; others become generic. */
export async function parseBody<S extends z.ZodType>(
  c: Context,
  schema: S,
): Promise<{ ok: true; value: z.output<S> } | { ok: false; error: string }> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return { ok: false, error: INVALID_BODY };
  }
  const result = schema.safeParse(raw);
  if (result.success) return { ok: true, value: result.data };
  const custom = result.error.issues.find((issue) => issue.code === 'custom');
  return { ok: false, error: custom?.message ?? INVALID_BODY };
}

/** Phones pass answers=0 to skip the answer list. */
export const wantsAnswers = (c: Context) => c.req.query('answers') !== '0';
