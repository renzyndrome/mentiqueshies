import { useState } from 'react';

export interface ActionStatus {
  readonly busy: boolean;
  readonly error: string | null;
  readonly done: string | null;
}

const IDLE: ActionStatus = { busy: false, error: null, done: null };

/** Tracks one panel's pending call, error and outcome message. */
export function useActionStatus() {
  const [status, setStatus] = useState<ActionStatus>(IDLE);

  const track = async (call: () => Promise<string | null>, doneMessage: string | null = null) => {
    setStatus({ busy: true, error: null, done: null });
    const error = await call();
    setStatus({ busy: false, error, done: error ? null : doneMessage });
    return error === null;
  };

  return { status, track };
}
