import { describe, expect, it } from 'vitest';
import { CLOUD_COLORS, layoutCloud } from './cloudLayout';

const word = (name: string, size: number) => ({ word: name, count: size, size });

describe('layoutCloud', () => {
  it('puts the biggest word in the middle', () => {
    const placed = layoutCloud([word('a1', 5), word('b2', 4), word('c3', 3), word('d4', 2), word('e5', 1)]);
    expect(placed.map((entry) => entry.word)).toEqual(['d4', 'b2', 'a1', 'c3', 'e5']);
  });

  it('colours words by rank', () => {
    const placed = layoutCloud([word('a1', 2), word('b2', 1)]);
    expect(placed.find((entry) => entry.word === 'a1')?.color).toBe(CLOUD_COLORS[0]);
    expect(placed.find((entry) => entry.word === 'b2')?.color).toBe(CLOUD_COLORS[1]);
  });

  it('handles an empty cloud', () => {
    expect(layoutCloud([])).toEqual([]);
  });
});
