import { QUESTION_STATUSES, SCREEN_VIEWS } from '../../shared/types';
import type { PublicAnswer, PublicState, QuestionStatus, ScreenView } from '../../shared/types';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isString = (value: unknown): value is string => typeof value === 'string';
const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const isQuestionNumber = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 1;

const isAnswer = (value: unknown): value is PublicAnswer =>
  isRecord(value) && typeof value.id === 'number' && isString(value.text) && isString(value.createdAt);

/** Shape check for state from /api/state and SSE. Returns null when anything looks off. */
export function parsePublicState(value: unknown): PublicState | null {
  if (!isRecord(value) || !isRecord(value.session) || !isRecord(value.counts)) return null;
  const { session, counts, answers, publicUrl } = value;
  if (!isString(session.title) || !isString(session.questionText) || !isString(session.updatedAt)) return null;
  if (!QUESTION_STATUSES.includes(session.questionStatus as QuestionStatus)) return null;
  if (!SCREEN_VIEWS.includes(session.screenView as ScreenView)) return null;
  if (!isQuestionNumber(session.questionNumber)) return null;
  if (!isCount(counts.joined) || !isCount(counts.answers)) return null;
  if (!Array.isArray(answers) || !answers.every(isAnswer) || !isString(publicUrl)) return null;
  return value as unknown as PublicState;
}

export function parseStateJson(raw: string): PublicState | null {
  try {
    return parsePublicState(JSON.parse(raw));
  } catch {
    return null;
  }
}
