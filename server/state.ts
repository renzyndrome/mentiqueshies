import type { AdminState, PublicAnswer, PublicState } from '../shared/types';
import type { Repository } from './repository';

export type StateVariant = 'full' | 'lite';

/** Public view: hidden answers excluded, question text withheld until the question opens. */
export function buildPublicState(repo: Repository, publicUrl: string, variant: StateVariant): PublicState {
  const session = repo.getSession();
  const answers: readonly PublicAnswer[] =
    variant === 'full'
      ? repo.listAnswers({ includeHidden: false }).map(({ id, text, createdAt, updatedAt }) => ({
          id,
          text,
          createdAt,
          updatedAt,
        }))
      : [];
  return {
    session: session.questionStatus === 'hidden' ? { ...session, questionText: '' } : session,
    answers,
    counts: { joined: repo.countParticipants(), answers: repo.countAnswers().total },
    publicUrl,
  };
}

export function buildAdminState(repo: Repository, publicUrl: string): AdminState {
  const { total, hidden } = repo.countAnswers();
  return {
    session: repo.getSession(),
    answers: repo.listAnswers({ includeHidden: true }),
    counts: { joined: repo.countParticipants(), answers: total, hidden },
    publicUrl,
  };
}
