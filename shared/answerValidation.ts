import { charLength, hasVisibleText, normalizeText } from './text';

export const MAX_ANSWER_LENGTH = 80;

export type AnswerError = 'invalid' | 'empty' | 'too_long';

export type AnswerValidation = { ok: true; value: string } | { ok: false; error: AnswerError };

export function answerLength(text: string): number {
  return charLength(text);
}

export function validateAnswer(input: unknown): AnswerValidation {
  if (typeof input !== 'string') return { ok: false, error: 'invalid' };
  const value = normalizeText(input);
  if (!hasVisibleText(value)) return { ok: false, error: 'empty' };
  if (charLength(value) > MAX_ANSWER_LENGTH) return { ok: false, error: 'too_long' };
  return { ok: true, value };
}

export const ANSWER_ERROR_MESSAGES: Readonly<Record<AnswerError, string>> = {
  invalid: 'Answer missing.',
  empty: 'Answer empty. Type a word or a short sentence.',
  too_long: `Answer too long. ${MAX_ANSWER_LENGTH} characters at most.`,
};
