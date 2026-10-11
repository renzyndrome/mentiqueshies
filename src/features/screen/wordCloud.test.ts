import { describe, expect, it } from 'vitest';
import {
  CLOUD_MAX_FONT,
  CLOUD_MIN_FONT,
  WORD_CLOUD_LIMIT,
  buildWordCloud,
  fontSizeFor,
  normalizeToken,
  tokenize,
} from './wordCloud';

const words = (cloud: ReturnType<typeof buildWordCloud>) => cloud.map((entry) => entry.word);

describe('normalizeToken', () => {
  it('lowercases and trims', () => {
    expect(normalizeToken('  Faithful ')).toBe('faithful');
  });

  it('strips punctuation around a word', () => {
    expect(normalizeToken('Peace!!!')).toBe('peace');
    expect(normalizeToken('"Hope,"')).toBe('hope');
    expect(normalizeToken('(grace)')).toBe('grace');
  });

  it('drops a possessive s, straight or curly', () => {
    expect(normalizeToken("God's")).toBe('god');
    expect(normalizeToken('God’s')).toBe('god');
  });

  it('keeps an inner hyphen in Tagalog words', () => {
    expect(normalizeToken('Pag-asa.')).toBe('pag-asa');
    expect(normalizeToken('-pag-asa-')).toBe('pag-asa');
  });

  it('keeps accented letters', () => {
    expect(normalizeToken('Biñan')).toBe('biñan');
  });
});

describe('tokenize', () => {
  it('splits on spaces and punctuation', () => {
    expect(tokenize('Peace, hope; joy!')).toEqual(['peace', 'hope', 'joy']);
    expect(tokenize('peace/hope')).toEqual(['peace', 'hope']);
  });

  it('drops one character words', () => {
    expect(tokenize('x y peace')).toEqual(['peace']);
  });

  it('drops English stop words', () => {
    expect(tokenize('The peace of the Lord is with me')).toEqual(['peace', 'lord']);
  });

  it('drops Tagalog stop words', () => {
    expect(tokenize('Hindi Niya ako iiwan')).toEqual(['iiwan']);
    expect(tokenize('Ang kapayapaan ng Diyos')).toEqual(['kapayapaan', 'diyos']);
  });

  it('keeps Tagalog and English content words side by side', () => {
    expect(tokenize('Peace at kapayapaan')).toEqual(['peace', 'kapayapaan']);
  });

  it('returns nothing for empty or whitespace text', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('   ')).toEqual([]);
  });
});

describe('buildWordCloud grouping', () => {
  it('returns an empty list when there are no answers', () => {
    expect(buildWordCloud([])).toEqual([]);
  });

  it('groups the same word across answers regardless of case and punctuation', () => {
    const cloud = buildWordCloud(['Peace', 'peace!', '  PEACE  ', 'Hope']);
    expect(cloud.map(({ word, count }) => ({ word, count }))).toEqual([
      { word: 'peace', count: 3 },
      { word: 'hope', count: 1 },
    ]);
  });

  it('counts a word once per answer', () => {
    const cloud = buildWordCloud(['peace peace peace', 'peace']);
    expect(cloud[0]).toMatchObject({ word: 'peace', count: 2 });
  });

  it('ignores answers that only contain stop words', () => {
    expect(buildWordCloud(['the and of', 'ang ng mga', 'a'])).toEqual([]);
  });

  it('breaks ties alphabetically', () => {
    expect(words(buildWordCloud(['joy', 'hope', 'peace']))).toEqual(['hope', 'joy', 'peace']);
  });

  it('gives the same result for the same answers in any order', () => {
    const answers = ['Faithful', 'Peace', 'faithful God', 'Healing', 'peace and joy'];
    const shuffled = [answers[3], answers[0], answers[4], answers[2], answers[1]] as string[];
    expect(buildWordCloud(shuffled)).toEqual(buildWordCloud(answers));
  });
});

describe('buildWordCloud top 14', () => {
  it('keeps at most 14 words', () => {
    expect(WORD_CLOUD_LIMIT).toBe(14);
  });

  it('keeps the 14 most frequent words in order of count', () => {
    const vocabulary = Array.from({ length: 20 }, (_, index) => `word${String.fromCharCode(97 + index)}`);
    const answers = vocabulary.flatMap((word, index) => Array.from({ length: 20 - index }, () => word));
    const cloud = buildWordCloud(answers);
    expect(cloud).toHaveLength(14);
    expect(words(cloud)).toEqual(vocabulary.slice(0, 14));
    expect(cloud[0]?.count).toBe(20);
    expect(cloud[13]?.count).toBe(7);
  });
});

describe('size scale', () => {
  it('gives the most frequent word the max size and the least frequent the min size', () => {
    const cloud = buildWordCloud(['peace', 'peace', 'peace', 'peace', 'hope', 'hope', 'joy']);
    expect(cloud[0]).toMatchObject({ word: 'peace', size: CLOUD_MAX_FONT });
    expect(cloud[2]).toMatchObject({ word: 'joy', size: CLOUD_MIN_FONT });
  });

  it('grows with count', () => {
    const cloud = buildWordCloud(['peace', 'peace', 'peace', 'peace', 'hope', 'hope', 'joy']);
    const sizes = cloud.map((entry) => entry.size);
    expect(sizes[0]).toBeGreaterThan(sizes[1] as number);
    expect(sizes[1]).toBeGreaterThan(sizes[2] as number);
  });

  it('gives equal counts the same size', () => {
    const cloud = buildWordCloud(['peace', 'peace', 'hope', 'hope', 'joy']);
    expect(cloud[0]?.size).toBe(cloud[1]?.size);
  });

  it('uses a middle size when every word has the same count', () => {
    const middle = Math.round((CLOUD_MIN_FONT + CLOUD_MAX_FONT) / 2);
    expect(fontSizeFor(3, 3, 3)).toBe(middle);
    expect(buildWordCloud(['peace', 'hope']).map((entry) => entry.size)).toEqual([middle, middle]);
  });

  it('stays within the min and max sizes', () => {
    for (let count = 1; count <= 10; count += 1) {
      const size = fontSizeFor(count, 1, 10);
      expect(size).toBeGreaterThanOrEqual(CLOUD_MIN_FONT);
      expect(size).toBeLessThanOrEqual(CLOUD_MAX_FONT);
    }
  });
});
