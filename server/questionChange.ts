import { normalizeText } from '../shared/text';
import type { QuestionStatus } from '../shared/types';

export interface QuestionChangeInput {
  readonly previousStatus: QuestionStatus;
  readonly nextStatus: QuestionStatus;
  readonly nextText: string;
  /** Text of the last opened question. Empty when nothing opened since the last reset. */
  readonly openedText: string;
  readonly answerCount: number;
}

export interface QuestionChange {
  /** Text to remember as the last opened question. */
  readonly openedText: string;
  /** True for a new question: every answer is deleted and the question number goes up by one. */
  readonly newQuestion: boolean;
}

/**
 * Opening (from hidden or closed) a text that differs from the last opened one starts a new
 * question. The first open after a reset only records the text, unless answers already exist.
 * Opening the same text again changes nothing. An edit while the question stays open keeps the
 * answers and updates the remembered text, so a later close and reopen does not clear them.
 */
export function planQuestionChange(input: QuestionChangeInput): QuestionChange {
  const opened = normalizeText(input.openedText);
  const next = normalizeText(input.nextText);
  const stillOpen = input.previousStatus === 'open' && input.nextStatus === 'open';
  if (stillOpen) return { openedText: next, newQuestion: false };
  const opening = input.previousStatus !== 'open' && input.nextStatus === 'open';
  if (!opening || next === opened) return { openedText: input.openedText, newQuestion: false };
  const firstOpen = opened === '' && input.answerCount === 0;
  return { openedText: next, newQuestion: !firstOpen };
}
