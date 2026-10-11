import { describe, expect, it } from 'vitest';
import { MAX_ANSWER_LENGTH, answerLength, validateAnswer } from './answerValidation';

describe('validateAnswer', () => {
  it('caps answers at 80 characters', () => {
    expect(MAX_ANSWER_LENGTH).toBe(80);
  });

  it('rejects input that is not a string', () => {
    expect(validateAnswer(42)).toEqual({ ok: false, error: 'invalid' });
    expect(validateAnswer(undefined)).toEqual({ ok: false, error: 'invalid' });
    expect(validateAnswer(null)).toEqual({ ok: false, error: 'invalid' });
    expect(validateAnswer({ text: 'hi' })).toEqual({ ok: false, error: 'invalid' });
  });

  it('rejects an empty string', () => {
    expect(validateAnswer('')).toEqual({ ok: false, error: 'empty' });
  });

  it('rejects whitespace only, including tabs, newlines and no-break spaces', () => {
    expect(validateAnswer('   ')).toEqual({ ok: false, error: 'empty' });
    expect(validateAnswer(' \t\n\r  ')).toEqual({ ok: false, error: 'empty' });
  });

  it('trims surrounding whitespace', () => {
    expect(validateAnswer('  Faithful  ')).toEqual({ ok: true, value: 'Faithful' });
  });

  it('collapses inner runs of whitespace and newlines to one space', () => {
    expect(validateAnswer('Hindi  Niya\n\nako   iiwan.')).toEqual({
      ok: true,
      value: 'Hindi Niya ako iiwan.',
    });
  });

  it('accepts exactly 80 characters', () => {
    const text = 'a'.repeat(80);
    expect(validateAnswer(text)).toEqual({ ok: true, value: text });
  });

  it('rejects 81 characters', () => {
    expect(validateAnswer('a'.repeat(81))).toEqual({ ok: false, error: 'too_long' });
  });

  it('measures the length after trimming', () => {
    const text = 'a'.repeat(80);
    expect(validateAnswer(`   ${text}   `)).toEqual({ ok: true, value: text });
  });

  it('counts unicode code points, not UTF-16 units', () => {
    const symbol = '\u{1F64F}';
    expect(validateAnswer(symbol.repeat(80))).toEqual({ ok: true, value: symbol.repeat(80) });
    expect(validateAnswer(symbol.repeat(81))).toEqual({ ok: false, error: 'too_long' });
  });

  it('normalizes to NFC so a letter with a combining mark counts once', () => {
    const decomposed = 'ñ'.repeat(80);
    const result = validateAnswer(decomposed);
    expect(result).toEqual({ ok: true, value: 'ñ'.repeat(80) });
  });

  it('keeps Tagalog, accents and punctuation as written', () => {
    expect(validateAnswer('Salamat po, Biñan!')).toEqual({ ok: true, value: 'Salamat po, Biñan!' });
  });

  it('treats invisible-only text as empty', () => {
    expect(validateAnswer('\u200b')).toEqual({ ok: false, error: 'empty' });
    expect(validateAnswer('\u200b\u200c\u200d\ufeff')).toEqual({ ok: false, error: 'empty' });
    expect(validateAnswer('\u2800 \u3164')).toEqual({ ok: false, error: 'empty' });
  });

  it('treats combining marks with no base letter as empty', () => {
    expect(validateAnswer('\u0301\u0301')).toEqual({ ok: false, error: 'empty' });
  });

  it('strips bidi override and isolate characters', () => {
    expect(validateAnswer('\u202eHope')).toEqual({ ok: true, value: 'Hope' });
    expect(validateAnswer('Peace\u2066 and joy\u2069')).toEqual({ ok: true, value: 'Peace and joy' });
  });

  it('keeps an answer that is only a symbol', () => {
    expect(validateAnswer('\u{1F64F}')).toEqual({ ok: true, value: '\u{1F64F}' });
  });

  it('replaces control characters with spaces', () => {
    expect(validateAnswer('Peace\u0000and\u0007joy')).toEqual({ ok: true, value: 'Peace and joy' });
  });
});

describe('answerLength', () => {
  it('counts code points after normalization', () => {
    expect(answerLength('Biñan')).toBe(5);
    expect(answerLength('ñ')).toBe(1);
    expect(answerLength('\u{1F64F}')).toBe(1);
    expect(answerLength('')).toBe(0);
  });
});
