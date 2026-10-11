import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { clearLastAnswer, isOtherQuestion, loadLastAnswer } from '../../lib/lastAnswer';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { useLiveState } from '../../lib/useLiveState';
import { SentView } from './SentView';

export function SentPage() {
  useDocumentTitle('Salamat | Quest Respond');
  const { state } = useLiveState({ answers: false });
  const navigate = useNavigate();
  const [stored] = useState(loadLastAnswer);

  // Until the state loads, the stored answer counts as current: the person just sent it.
  const stale = state ? isOtherQuestion(stored, state.session.questionNumber) : false;

  // A different question opened since this answer was sent. Drop it and answer the new one.
  useEffect(() => {
    if (!stale) return;
    clearLastAnswer();
    void navigate({ to: '/answer', replace: true });
  }, [stale, navigate]);

  // Until the state loads, assume open: the person just sent an answer.
  const closed = state ? state.session.questionStatus !== 'open' : false;

  return (
    <SentView
      text={stored && !stale ? stored.text : null}
      closed={closed}
      onChangeAnswer={() => void navigate({ to: '/answer', search: { edit: true } })}
    />
  );
}
