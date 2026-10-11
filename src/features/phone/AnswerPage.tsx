import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { postAnswer, postJoin } from '../../lib/api';
import { getDeviceToken } from '../../lib/deviceToken';
import { answerTextFor, loadLastAnswer, saveLastAnswer } from '../../lib/lastAnswer';
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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Join is idempotent. Counting the device here keeps the joined count right after a reset
  // and for phones that open /answer directly.
  useEffect(() => {
    void postJoin(getDeviceToken());
  }, []);

  const handleSubmit = async (text: string, questionNumber: number) => {
    setSending(true);
    setError(null);
    const result = await postAnswer(getDeviceToken(), text);
    setSending(false);
    if (!result.ok) {
      setError(result.status === 0 ? 'Not sent. Check the connection and retry.' : result.error);
      return;
    }
    saveLastAnswer({ text: result.data.text, questionNumber });
    void navigate({ to: '/sent' });
  };

  if (!state) return <LoadingView />;

  const { questionStatus, questionText, questionNumber, title } = state.session;
  if (questionStatus === 'hidden') return <WaitingView title={title} />;

  // Only an answer sent for this same question shows or prefills.
  const lastText = answerTextFor(loadLastAnswer(), questionNumber);
  if (questionStatus === 'closed') {
    return <SentView text={lastText} closed onChangeAnswer={() => undefined} />;
  }

  return (
    <AnswerView
      // A new question remounts the form, so a draft for the old one does not carry over.
      key={questionNumber}
      questionText={questionText}
      initialText={edit ? (lastText ?? '') : ''}
      sending={sending}
      error={error}
      onSubmit={(text) => void handleSubmit(text, questionNumber)}
    />
  );
}
