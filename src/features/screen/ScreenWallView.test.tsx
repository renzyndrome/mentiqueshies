// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ScreenWallView } from './ScreenWallView';

afterEach(cleanup);

const baseProps = {
  title: 'Sunday Family Service',
  questionText: 'Who will you pray for this week?',
  host: 'mentiqueshies.questlaguna.org',
};

const answer = (id: number, text: string) => ({
  id,
  text,
  createdAt: '2026-10-11T10:00:00.000Z',
  updatedAt: '2026-10-11T10:00:00.000Z',
});

describe('ScreenWallView', () => {
  it('drops back to the empty state when the answers clear for a new question', () => {
    const { container, rerender } = render(
      <ScreenWallView {...baseProps} answers={[answer(2, 'My family'), answer(1, 'Healing')]} answerCount={2} />,
    );
    expect(screen.getByText('"My family"')).toBeTruthy();

    rerender(<ScreenWallView {...baseProps} answers={[]} answerCount={0} />);

    expect(screen.queryByText('"My family"')).toBeNull();
    expect(screen.queryByText(/Just in/)).toBeNull();
    expect(screen.getByText('Waiting for the first answer.')).toBeTruthy();
    expect(container.textContent).toContain('0 answers and counting');
  });
});
