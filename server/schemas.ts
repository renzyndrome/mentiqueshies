// Namespace import: the named { z } re-export is dropped when Vitest runs on Bun.
import * as z from 'zod';
import { DEVICE_TOKEN_PATTERN, MAX_QUESTION_LENGTH, MAX_TITLE_LENGTH } from '../shared/limits';
import { charLength, hasVisibleText, normalizeText } from '../shared/text';
import { QUESTION_STATUSES, SCREEN_VIEWS } from '../shared/types';

const deviceToken = z.string().regex(DEVICE_TOKEN_PATTERN);

export const joinBodySchema = z.strictObject({ deviceToken });

// Text rules (trim, 80 limit) live in shared/answerValidation so the phone uses the same ones.
export const answerBodySchema = z.strictObject({ deviceToken, text: z.string().max(2_000) });

const titleSchema = z
  .string()
  .max(1_000)
  .transform(normalizeText)
  .refine(hasVisibleText, 'Title required.')
  .refine((value) => charLength(value) <= MAX_TITLE_LENGTH, `Title too long. ${MAX_TITLE_LENGTH} characters at most.`);

const questionSchema = z
  .string()
  .max(2_000)
  .transform(normalizeText)
  .refine(
    (value) => charLength(value) <= MAX_QUESTION_LENGTH,
    `Question too long. ${MAX_QUESTION_LENGTH} characters at most.`,
  );

export const sessionUpdateSchema = z
  .strictObject({
    title: titleSchema.optional(),
    questionText: questionSchema.optional(),
    questionStatus: z.enum(QUESTION_STATUSES).optional(),
    screenView: z.enum(SCREEN_VIEWS).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'No changes sent.');

export const answerVisibilitySchema = z.strictObject({ hidden: z.boolean() });

export const answerIdSchema = z
  .string()
  .regex(/^[1-9][0-9]{0,15}$/)
  .transform(Number)
  .refine((value) => Number.isSafeInteger(value));
