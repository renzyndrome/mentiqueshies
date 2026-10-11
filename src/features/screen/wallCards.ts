import type { PublicAnswer } from '../../../shared/types';

export const WALL_MAX_CARDS = 9;

export interface WallVariant {
  readonly background: string;
  readonly border: string | null;
  readonly rule: string;
  readonly text: string;
  readonly meta: string;
  /** Degrees. */
  readonly rotate: number;
}

const paper = (rotate: number): WallVariant => ({
  background: '#FFFFFF',
  border: '#E4E1E2',
  rule: '#D81E2F',
  text: '#141315',
  meta: '#6B6266',
  rotate,
});

/** Card variants in the order of ScreenWall.dc.html. */
export const WALL_VARIANTS: readonly WallVariant[] = [
  paper(-1.5),
  { background: '#D81E2F', border: null, rule: '#FFFFFF', text: '#FFFFFF', meta: '#FDE4E7', rotate: 1 },
  paper(-0.5),
  { background: '#141315', border: null, rule: '#E8B11F', text: '#FFFFFF', meta: '#C9C2C5', rotate: 0.8 },
  paper(-1),
  { background: '#FDE4E7', border: null, rule: '#8E0E1E', text: '#141315', meta: '#8E0E1E', rotate: 1.4 },
  paper(0.4),
  paper(-1.2),
  { background: '#E8B11F', border: null, rule: '#141315', text: '#141315', meta: '#3A3437', rotate: 0.9 },
];

export interface WallCard {
  readonly id: number;
  readonly text: string;
  readonly label: string;
  readonly variant: WallVariant;
}

/** Newest first (the server already orders them), at most 9, variants in order by position. */
export function buildWallCards(answers: readonly PublicAnswer[]): readonly WallCard[] {
  return answers.slice(0, WALL_MAX_CARDS).map((answer, index) => ({
    id: answer.id,
    text: answer.text,
    label: 'Anonymous',
    variant: WALL_VARIANTS[index % WALL_VARIANTS.length] as WallVariant,
  }));
}
