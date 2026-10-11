// Text helpers shared by the client and the server.

const CONTROL_CHARS = /[\u0000-\u001f\u007f-\u009f]/g;
// Zero-width, bidi override and isolate, and blank-looking filler characters. Removed outright.
const INVISIBLE_CHARS =
  /[­؜ᅟᅠ឴឵᠎​-‏‪-‮⁠-⁯⠀ㅤ﻿ﾠ]/g;
const WHITESPACE_RUN = /\s+/g;
const VISIBLE_CHAR = /[\p{L}\p{N}\p{S}\p{P}]/u;

/** NFC normalize, drop invisible characters, turn control characters into spaces, collapse whitespace, trim. */
export function normalizeText(input: string): string {
  return input
    .normalize('NFC')
    .replace(INVISIBLE_CHARS, '')
    .replace(CONTROL_CHARS, ' ')
    .replace(WHITESPACE_RUN, ' ')
    .trim();
}

/** True when the text has at least one letter, number, symbol or punctuation mark. */
export function hasVisibleText(input: string): boolean {
  return VISIBLE_CHAR.test(input);
}

/** Length in Unicode code points after NFC normalization. */
export function charLength(input: string): number {
  return Array.from(input.normalize('NFC')).length;
}
