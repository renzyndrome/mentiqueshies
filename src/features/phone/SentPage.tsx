import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { loadLastAnswer } from '../../lib/lastAnswer';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { useLiveState } from '../../lib/useLiveState';
import { SentView } from './SentView';

export function SentPage() {
  useDocumentTitle('Salamat | Quest Respond');
  const { state } = useLiveState({ answers: false });
  const navigate = useNavigate();
  const [text] = useState(loadLastAnswer);

  // Until the state loads, assume open: the person just sent an answer.
  const closed = state ? state.session.questionStatus !== 'open' : false;

  return (
    <SentView
      text={text}
      closed={closed}
      onChangeAnswer={() => void navigate({ to: '/answer', search: { edit: true } })}
    />
  );
}
