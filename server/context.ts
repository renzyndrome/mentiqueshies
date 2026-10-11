import type { StateBroadcaster } from './broadcaster';
import type { RateLimiter } from './rateLimit';
import type { Repository } from './repository';

export interface AppContext {
  readonly repo: Repository;
  readonly broadcaster: StateBroadcaster;
  readonly answerLimiter: RateLimiter;
  readonly publicUrl: string;
  readonly heartbeatMs: number;
}
