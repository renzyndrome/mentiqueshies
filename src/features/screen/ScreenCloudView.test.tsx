// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ScreenCloudView } from './ScreenCloudView';

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

describe('ScreenCloudView', () => {
  it('drops back to the empty state when the answers clear for a new question', () => {
    const { rerender } = render(
      <ScreenCloudView {...baseProps} answers={[answer(1, 'Faithful'), answer(2, 'Faithful God')]} answerCount={2} />,
    );
    expect(screen.getByText('faithful')).toBeTruthy();

    rerender(<ScreenCloudView {...baseProps} answers={[]} answerCount={0} />);

    expect(screen.queryByText('faithful')).toBeNull();
    expect(screen.getByText('Waiting for the first answer.')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('answers')).toBeTruthy();
  });
});
