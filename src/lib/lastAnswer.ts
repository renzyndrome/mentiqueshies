import { readStorage, removeStorage, writeStorage } from './storage';

const STORAGE_KEY = 'quest-respond:last-answer';

/** What this phone sent last, and for which question. */
export interface LastAnswer {
  readonly text: string;
  readonly questionNumber: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

function toLastAnswer(value: unknown): LastAnswer | null {
  if (!isRecord(value)) return null;
  const { text, questionNumber } = value;
  if (typeof text !== 'string' || text.trim().length === 0) return null;
  if (!Number.isInteger(questionNumber) || (questionNumber as number) < 1) return null;
  return { text, questionNumber: questionNumber as number };
}

export function saveLastAnswer(answer: LastAnswer): void {
  writeStorage(STORAGE_KEY, JSON.stringify({ text: answer.text, questionNumber: answer.questionNumber }));
}

/** The stored answer, or null. Values from older versions (a bare string) count as absent. */
export function loadLastAnswer(): LastAnswer | null {
  const raw = readStorage(STORAGE_KEY);
  if (!raw) return null;
  try {
    return toLastAnswer(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearLastAnswer(): void {
  removeStorage(STORAGE_KEY);
}

/** The stored text when it was sent for this question, else null. */
export function answerTextFor(answer: LastAnswer | null, questionNumber: number): string | null {
  return answer && answer.questionNumber === questionNumber ? answer.text : null;
}

/** True when a stored answer exists and belongs to a different question. */
export function isOtherQuestion(answer: LastAnswer | null, questionNumber: number): boolean {
  return answer !== null && answer.questionNumber !== questionNumber;
}
