import { useCallback, useState } from 'react';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { AdminDashboard } from './AdminDashboard';
import { clearAdminKey, loadAdminKey, saveAdminKey } from './adminKey';
import { PasscodeForm } from './PasscodeForm';

export function AdminPage() {
  useDocumentTitle('Admin | Quest Respond');
  const [adminKey, setAdminKey] = useState<string | null>(loadAdminKey);
  const [notice, setNotice] = useState<string | null>(null);

  const signOut = useCallback((message: string | null) => {
    clearAdminKey();
    setAdminKey(null);
    setNotice(message);
  }, []);

  const handleUnauthorized = useCallback(() => signOut('Passcode no longer valid. Enter it again.'), [signOut]);
  const handleSignOut = useCallback(() => signOut(null), [signOut]);

  if (!adminKey) {
    return (
      <PasscodeForm
        notice={notice}
        onUnlock={(key) => {
          saveAdminKey(key);
          setNotice(null);
          setAdminKey(key);
        }}
      />
    );
  }

  return <AdminDashboard adminKey={adminKey} onSignOut={handleSignOut} onUnauthorized={handleUnauthorized} />;
}
