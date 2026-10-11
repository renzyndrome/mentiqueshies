import { describe, expect, it } from 'vitest';
import { planQuestionChange } from './questionChange';
import type { QuestionChangeInput } from './questionChange';

const base: QuestionChangeInput = {
  previousStatus: 'closed',
  nextStatus: 'open',
  nextText: 'Who will you pray for this week?',
  openedText: 'What is one promise you are holding on to?',
  answerCount: 4,
};

const plan = (overrides: Partial<QuestionChangeInput>) => planQuestionChange({ ...base, ...overrides });

describe('planQuestionChange', () => {
  it('starts a new question when a different text opens from closed or hidden', () => {
    const expected = { openedText: base.nextText, newQuestion: true };
    expect(plan({ previousStatus: 'closed' })).toEqual(expected);
    expect(plan({ previousStatus: 'hidden' })).toEqual(expected);
  });

  it('starts a new question even when no answers exist yet', () => {
    expect(plan({ answerCount: 0 })).toEqual({ openedText: base.nextText, newQuestion: true });
  });

  it('keeps everything when the same text opens again, compared after normalizing', () => {
    expect(plan({ nextText: `  ${base.openedText}​ ` })).toEqual({
      openedText: base.openedText,
      newQuestion: false,
    });
  });

  it('keeps the answers and remembers the new text while the question stays open', () => {
    expect(plan({ previousStatus: 'open' })).toEqual({ openedText: base.nextText, newQuestion: false });
  });

  it('keeps everything when the question closes or hides', () => {
    expect(plan({ previousStatus: 'open', nextStatus: 'closed' })).toEqual({
      openedText: base.openedText,
      newQuestion: false,
    });
    expect(plan({ previousStatus: 'closed', nextStatus: 'hidden' })).toEqual({
      openedText: base.openedText,
      newQuestion: false,
    });
  });

  it('only records the text on the first open with no answers', () => {
    expect(plan({ openedText: '', answerCount: 0 })).toEqual({ openedText: base.nextText, newQuestion: false });
  });

  it('starts a new question on the first open when answers already exist', () => {
    expect(plan({ openedText: '', answerCount: 2 })).toEqual({ openedText: base.nextText, newQuestion: true });
  });

  it('stores the opened text normalized', () => {
    expect(plan({ nextText: '  Who   will you pray for?  ' }).openedText).toBe('Who will you pray for?');
  });
});
