import type { CloudWord } from './wordCloud';

/** Word colours by rank, in the order of ScreenCloud.dc.html (largest word first). */
export const CLOUD_COLORS = [
  '#FFFFFF',
  '#E8B11F',
  '#D81E2F',
  '#F26A77',
  '#FBF5E9',
  '#D81E2F',
  '#C9C2C5',
  '#F26A77',
  '#FBF5E9',
  '#C9C2C5',
  '#E8B11F',
  '#C9C2C5',
  '#C9C2C5',
  '#F26A77',
] as const;

export interface PlacedWord extends CloudWord {
  readonly rank: number;
  readonly color: string;
}

/** Colours each word by rank and orders them centre-out, so the biggest word sits in the middle. */
export function layoutCloud(words: readonly CloudWord[]): readonly PlacedWord[] {
  return words
    .map((word, rank) => ({ ...word, rank, color: CLOUD_COLORS[rank % CLOUD_COLORS.length] ?? '#FFFFFF' }))
    .reduce<readonly PlacedWord[]>((placed, word, index) => (index % 2 === 0 ? [...placed, word] : [word, ...placed]), []);
}
