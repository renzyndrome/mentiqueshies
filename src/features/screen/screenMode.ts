import type { SessionState } from '../../../shared/types';

export type ScreenMode = 'blank' | 'join' | 'cloud' | 'wall';

/** Blank wins. Otherwise the join view until a question is open, then the chosen view. */
export function resolveScreenMode(session: Pick<SessionState, 'questionStatus' | 'screenView'>): ScreenMode {
  if (session.screenView === 'blank') return 'blank';
  if (session.questionStatus !== 'open') return 'join';
  return session.screenView;
}
