import { describe, expect, it } from 'vitest';
import { parsePublicState, parseStateJson } from './parseState';

const validState = () => ({
  session: {
    title: 'Sunday Family Service',
    questionText: 'Who will you pray for this week?',
    questionStatus: 'open',
    screenView: 'cloud',
    questionNumber: 2,
    updatedAt: '2026-10-11T10:00:00.000Z',
  },
  answers: [{ id: 1, text: 'My family', createdAt: '2026-10-11T10:01:00.000Z', updatedAt: '2026-10-11T10:01:00.000Z' }],
  counts: { joined: 3, answers: 1 },
  publicUrl: 'https://mentiqueshies.questlaguna.org',
});

const withQuestionNumber = (questionNumber: unknown) => {
  const state = validState();
  return { ...state, session: { ...state.session, questionNumber } };
};

describe('parsePublicState', () => {
  it('accepts a well formed state', () => {
    const state = validState();
    expect(parsePublicState(state)).toEqual(state);
  });

  it('rejects a state without questionNumber', () => {
    const state = validState();
    const { questionNumber: _dropped, ...session } = state.session;
    expect(parsePublicState({ ...state, session })).toBeNull();
  });

  it('rejects a questionNumber that is not a whole number of 1 or more', () => {
    for (const value of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '2', null]) {
      expect(parsePublicState(withQuestionNumber(value)), String(value)).toBeNull();
    }
  });

  it('accepts question number 1', () => {
    expect(parsePublicState(withQuestionNumber(1))?.session.questionNumber).toBe(1);
  });
});

describe('parseStateJson', () => {
  it('parses valid JSON and returns null for broken JSON', () => {
    expect(parseStateJson(JSON.stringify(validState()))?.session.questionNumber).toBe(2);
    expect(parseStateJson('{not json')).toBeNull();
  });
});
