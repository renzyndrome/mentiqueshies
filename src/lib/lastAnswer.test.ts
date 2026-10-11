// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { answerTextFor, clearLastAnswer, isOtherQuestion, loadLastAnswer, saveLastAnswer } from './lastAnswer';

const STORAGE_KEY = 'quest-respond:last-answer';

afterEach(() => window.localStorage.clear());

describe('lastAnswer storage', () => {
  it('returns the saved text and question number', () => {
    saveLastAnswer({ text: 'Hindi Niya ako iiwan.', questionNumber: 2 });
    expect(loadLastAnswer()).toEqual({ text: 'Hindi Niya ako iiwan.', questionNumber: 2 });
  });

  it('treats an old bare string value as absent', () => {
    window.localStorage.setItem(STORAGE_KEY, 'Faithful');
    expect(loadLastAnswer()).toBeNull();
  });

  it('treats any other stored shape as absent', () => {
    const values = [
      '"Faithful"',
      '42',
      'null',
      '[]',
      '{"text":"Faithful"}',
      '{"questionNumber":1}',
      '{"text":"   ","questionNumber":1}',
      '{"text":"Faithful","questionNumber":0}',
      '{"text":"Faithful","questionNumber":1.5}',
      '{"text":"Faithful","questionNumber":"1"}',
      '{"text":7,"questionNumber":1}',
    ];
    for (const value of values) {
      window.localStorage.setItem(STORAGE_KEY, value);
      expect(loadLastAnswer(), value).toBeNull();
    }
  });

  it('returns null when nothing is stored, and after a clear', () => {
    expect(loadLastAnswer()).toBeNull();
    saveLastAnswer({ text: 'Peace', questionNumber: 1 });
    clearLastAnswer();
    expect(loadLastAnswer()).toBeNull();
  });
});

describe('answerTextFor', () => {
  it('returns the text only for the same question', () => {
    const stored = { text: 'Peace', questionNumber: 3 };
    expect(answerTextFor(stored, 3)).toBe('Peace');
    expect(answerTextFor(stored, 4)).toBeNull();
    expect(answerTextFor(null, 3)).toBeNull();
  });
});

describe('isOtherQuestion', () => {
  it('is true only when a stored answer belongs to a different question', () => {
    const stored = { text: 'Peace', questionNumber: 1 };
    expect(isOtherQuestion(stored, 2)).toBe(true);
    expect(isOtherQuestion(stored, 1)).toBe(false);
    expect(isOtherQuestion(null, 2)).toBe(false);
  });
});
