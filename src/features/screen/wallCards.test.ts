import { describe, expect, it } from 'vitest';
import { WALL_MAX_CARDS, WALL_VARIANTS, buildWallCards } from './wallCards';

const answer = (id: number, text = `Answer ${id}`) => ({ id, text, createdAt: '', updatedAt: '' });

describe('buildWallCards', () => {
  it('shows at most 9 cards, keeping the order given (newest first)', () => {
    const answers = Array.from({ length: 12 }, (_, index) => answer(12 - index));
    const cards = buildWallCards(answers);
    expect(WALL_MAX_CARDS).toBe(9);
    expect(cards).toHaveLength(9);
    expect(cards.map((card) => card.id)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4]);
  });

  it('rotates through the colour variants in order', () => {
    const cards = buildWallCards(Array.from({ length: 9 }, (_, index) => answer(index + 1)));
    expect(cards.map((card) => card.variant)).toEqual(WALL_VARIANTS.slice(0, 9));
  });

  it('labels every card Anonymous', () => {
    const cards = buildWallCards([answer(1)]);
    expect(cards[0]?.label).toBe('Anonymous');
  });

  it('returns no cards for no answers', () => {
    expect(buildWallCards([])).toEqual([]);
  });
});
