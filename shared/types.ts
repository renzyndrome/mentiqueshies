export const QUESTION_STATUSES = ['hidden', 'open', 'closed'] as const;
export const SCREEN_VIEWS = ['cloud', 'wall', 'blank'] as const;

export type QuestionStatus = (typeof QUESTION_STATUSES)[number];
export type ScreenView = (typeof SCREEN_VIEWS)[number];

export interface SessionState {
  readonly title: string;
  readonly questionText: string;
  readonly questionStatus: QuestionStatus;
  readonly screenView: ScreenView;
  /** Starts at 1. Goes up by one each time a different question opens. Back to 1 on reset. */
  readonly questionNumber: number;
  readonly updatedAt: string;
}

export interface PublicAnswer {
  readonly id: number;
  readonly text: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AdminAnswer extends PublicAnswer {
  readonly hidden: boolean;
}

export interface PublicState {
  readonly session: SessionState;
  /** Visible answers only, newest first. Empty when requested with answers=0. */
  readonly answers: readonly PublicAnswer[];
  /** answers counts every stored answer, hidden ones included. */
  readonly counts: { readonly joined: number; readonly answers: number };
  readonly publicUrl: string;
}

export interface AdminState {
  readonly session: SessionState;
  /** Every answer, hidden ones included, newest first. Never carries device tokens. */
  readonly answers: readonly AdminAnswer[];
  readonly counts: {
    readonly joined: number;
    readonly answers: number;
    readonly hidden: number;
  };
  readonly publicUrl: string;
}

export interface SessionUpdate {
  readonly title?: string;
  readonly questionText?: string;
  readonly questionStatus?: QuestionStatus;
  readonly screenView?: ScreenView;
}

export type ApiResult<T> = { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: string };
