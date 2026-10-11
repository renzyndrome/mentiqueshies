import { STOP_WORDS } from './stopWords';

export const WORD_CLOUD_LIMIT = 14;
export const CLOUD_MIN_FONT = 38;
export const CLOUD_MAX_FONT = 188;

export interface CloudWord {
  readonly word: string;
  /** Number of answers that contain the word. */
  readonly count: number;
  /** Font size in px on the 1920x1080 stage. */
  readonly size: number;
}

const CURLY_APOSTROPHES = /[‘’ʼ`´]/g;
// Anything that is not a letter, combining mark, digit, apostrophe or hyphen.
const NON_WORD = /[^\p{L}\p{M}\p{N}'-]+/gu;
const NON_WORD_SPLIT = /[^\p{L}\p{M}\p{N}'-]+/u;

/** Lowercase, punctuation stripped, possessive s dropped, inner hyphens kept ("pag-asa"). */
export function normalizeToken(raw: string): string {
  return raw
    .normalize('NFC')
    .toLowerCase()
    .replace(CURLY_APOSTROPHES, "'")
    .replace(NON_WORD, '')
    .replace(/'s$/u, '')
    .replace(/'/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

const isContentWord = (token: string) => Array.from(token).length >= 2 && !STOP_WORDS.has(token);

/** Content words of one answer, in order. Tagalog and English both kept. */
export function tokenize(text: string): string[] {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(CURLY_APOSTROPHES, "'")
    .split(NON_WORD_SPLIT)
    .map(normalizeToken)
    .filter(isContentWord);
}

/** Linear scale from min to max font by count. Equal counts share the middle size. */
export function fontSizeFor(count: number, minCount: number, maxCount: number): number {
  if (maxCount <= minCount) return Math.round((CLOUD_MIN_FONT + CLOUD_MAX_FONT) / 2);
  const ratio = Math.min(1, Math.max(0, (count - minCount) / (maxCount - minCount)));
  return Math.round(CLOUD_MIN_FONT + ratio * (CLOUD_MAX_FONT - CLOUD_MIN_FONT));
}

const byCountThenWord = (a: { word: string; count: number }, b: { word: string; count: number }) =>
  b.count - a.count || (a.word < b.word ? -1 : a.word > b.word ? 1 : 0);

/** Groups answers into the top words. A word counts once per answer. */
export function buildWordCloud(texts: readonly string[], limit: number = WORD_CLOUD_LIMIT): CloudWord[] {
  const counts = new Map<string, number>();
  for (const text of texts) {
    for (const token of new Set(tokenize(text))) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  const top = Array.from(counts, ([word, count]) => ({ word, count }))
    .sort(byCountThenWord)
    .slice(0, limit);
  if (top.length === 0) return [];

  const maxCount = top[0]?.count ?? 0;
  const minCount = top[top.length - 1]?.count ?? 0;
  return top.map(({ word, count }) => ({ word, count, size: fontSizeFor(count, minCount, maxCount) }));
}
