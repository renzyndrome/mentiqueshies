import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { postJoin } from '../../lib/api';
import { getDeviceToken } from '../../lib/deviceToken';
import { clearLastAnswer } from '../../lib/lastAnswer';
import { publicHost } from '../../lib/publicHost';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { useLiveState } from '../../lib/useLiveState';
import { JoinView } from './JoinView';

export function JoinPage() {
  useDocumentTitle('Quest Respond');
  const { state } = useLiveState({ answers: false });
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    const result = await postJoin(getDeviceToken());
    setJoining(false);
    if (!result.ok) {
      setError(result.status === 0 ? 'Join failed. Check the connection and retry.' : result.error);
      return;
    }
    // A new visit starts clean: no answer from a previous Sunday on the Sent card or in the edit field.
    clearLastAnswer();
    void navigate({ to: '/answer' });
  };

  return (
    <JoinView
      title={state?.session.title ?? ''}
      host={publicHost(state?.publicUrl)}
      joining={joining}
      error={error}
      onJoin={() => void handleJoin()}
    />
  );
}
