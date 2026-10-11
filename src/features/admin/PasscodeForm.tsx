import { useState } from 'react';
import type { FormEvent } from 'react';
import { Lockup } from '../../components/Lockup';
import { fetchAdminState } from './adminApi';

interface PasscodeFormProps {
  readonly notice: string | null;
  readonly onUnlock: (adminKey: string) => void;
}

export function PasscodeForm({ notice, onUnlock }: PasscodeFormProps) {
  const [value, setValue] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const key = value.trim();
    if (key.length === 0) {
      setError('Passcode required.');
      return;
    }
    setChecking(true);
    setError(null);
    const result = await fetchAdminState(key);
    setChecking(false);
    if (result.ok) {
      onUnlock(key);
      return;
    }
    setError(result.status === 401 ? 'Passcode incorrect.' : result.error);
  };

  const message = error ?? notice;

  return (
    <div className="min-h-dvh bg-cream-50">
      <main className="phone-shell justify-center gap-8">
        <Lockup sub="ADMIN" />
        <form className="admin-card" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <h1 className="font-wordmark text-2xl leading-[1.25] font-semibold">Media team</h1>
          <label className="flex flex-col gap-2">
            <span className="text-[13px] leading-none font-semibold">Admin passcode</span>
            <input
              type="password"
              autoComplete="current-password"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="field h-[52px]"
            />
          </label>
          {message ? (
            <p role="alert" className="text-sm font-semibold text-brand-text">
              {message}
            </p>
          ) : null}
          <button type="submit" className="btn-primary" disabled={checking} aria-busy={checking}>
            Unlock
          </button>
        </form>
      </main>
    </div>
  );
}
