import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { postAnswer, postJoin } from '../../lib/api';
import { getDeviceToken } from '../../lib/deviceToken';
import { loadLastAnswer, saveLastAnswer } from '../../lib/lastAnswer';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { useLiveState } from '../../lib/useLiveState';
import { AnswerView } from './AnswerView';
import { LoadingView } from './LoadingView';
import { SentView } from './SentView';
import { WaitingView } from './WaitingView';

export function AnswerPage() {
  useDocumentTitle('Your answer | Quest Respond');
  const { edit } = useSearch({ from: '/answer' });
  const { state } = useLiveState({ answers: false });
  const navigate = useNavigate();
  const [initialText] = useState(() => (edit ? (loadLastAnswer() ?? '') : ''));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Join is idempotent. Counting the device here keeps the joined count right after a reset
  // and for phones that open /answer directly.
  useEffect(() => {
    void postJoin(getDeviceToken());
  }, []);

  const handleSubmit = async (text: string) => {
    setSending(true);
    setError(null);
    const result = await postAnswer(getDeviceToken(), text);
    setSending(false);
    if (!result.ok) {
      setError(result.status === 0 ? 'Not sent. Check the connection and retry.' : result.error);
      return;
    }
    saveLastAnswer(result.data.text);
    void navigate({ to: '/sent' });
  };

  if (!state) return <LoadingView />;

  const { questionStatus, questionText, title } = state.session;
  if (questionStatus === 'hidden') return <WaitingView title={title} />;
  if (questionStatus === 'closed') {
    return <SentView text={loadLastAnswer()} closed onChangeAnswer={() => undefined} />;
  }

  return (
    <AnswerView
      questionText={questionText}
      initialText={initialText}
      sending={sending}
      error={error}
      onSubmit={(text) => void handleSubmit(text)}
    />
  );
}
