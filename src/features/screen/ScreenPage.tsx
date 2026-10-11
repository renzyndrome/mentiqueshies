import { publicHost } from '../../lib/publicHost';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { useLiveState } from '../../lib/useLiveState';
import { ScreenCloudView } from './ScreenCloudView';
import { ScreenJoinView } from './ScreenJoinView';
import { ScreenStage } from './ScreenStage';
import { ScreenWallView } from './ScreenWallView';
import { resolveScreenMode } from './screenMode';

export function ScreenPage() {
  useDocumentTitle('Screen | Quest Respond');
  const { state } = useLiveState({ answers: true });

  if (!state) return <div className="fixed inset-0 bg-ink-1000" aria-busy="true" />;

  const mode = resolveScreenMode(state.session);
  if (mode === 'blank') return <div className="fixed inset-0 cursor-none bg-black" aria-label="Blank screen" />;

  const host = publicHost(state.publicUrl);
  const shared = {
    title: state.session.title,
    questionText: state.session.questionText,
    answers: state.answers,
    answerCount: state.counts.answers,
    host,
  };

  return (
    <ScreenStage>
      {mode === 'join' ? (
        <ScreenJoinView joined={state.counts.joined} publicUrl={state.publicUrl} host={host} />
      ) : mode === 'cloud' ? (
        <ScreenCloudView {...shared} />
      ) : (
        <ScreenWallView {...shared} />
      )}
    </ScreenStage>
  );
}
