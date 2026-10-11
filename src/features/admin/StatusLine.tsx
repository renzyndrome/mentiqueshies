import type { ActionStatus } from './useActionStatus';

export function StatusLine({ status }: { readonly status: ActionStatus }) {
  if (status.error) {
    return (
      <p role="alert" className="text-sm font-semibold text-brand-text">
        {status.error}
      </p>
    );
  }
  if (status.done) {
    return (
      <p role="status" className="text-sm font-semibold text-fg-muted">
        {status.done}
      </p>
    );
  }
  return null;
}
