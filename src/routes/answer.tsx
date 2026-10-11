import { createRoute } from '@tanstack/react-router';
import { AnswerPage } from '../features/phone/AnswerPage';
import { rootRoute } from './root';

interface AnswerSearch {
  /** true when coming from "Change my answer": prefill the last answer. */
  readonly edit?: boolean;
}

export const answerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/answer',
  validateSearch: (search: Record<string, unknown>): AnswerSearch =>
    search.edit === true || search.edit === 'true' ? { edit: true } : {},
  component: AnswerPage,
});
