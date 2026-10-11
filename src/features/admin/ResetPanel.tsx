import { useState } from 'react';
import { resetSession } from './adminApi';
import { StatusLine } from './StatusLine';
import type { AdminRunner } from './useAdminState';
import { useActionStatus } from './useActionStatus';

export function ResetPanel({ run }: { readonly run: AdminRunner }) {
  const [confirming, setConfirming] = useState(false);
  const { status, track } = useActionStatus();

  const confirm = async () => {
    await track(() => run(resetSession), 'Session reset.');
    setConfirming(false);
  };

  return (
    <section aria-labelledby="reset-heading" className="admin-card">
      <h2 id="reset-heading" className="font-wordmark text-base leading-[1.3] font-semibold">
        Reset session
      </h2>
      <p className="text-sm text-fg-muted">Deletes all answers and the joined count. Hides the question.</p>
      {confirming ? (
        <>
          <p role="alert" className="text-sm font-semibold text-brand-text">
            Deletes all answers. Not undoable.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-outline btn-solid" disabled={status.busy} onClick={() => void confirm()}>
              Confirm reset
            </button>
            <button type="button" className="btn-outline" disabled={status.busy} onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <button type="button" className="btn-outline" onClick={() => setConfirming(true)}>
          Reset session
        </button>
      )}
      <StatusLine status={status} />
    </section>
  );
}
