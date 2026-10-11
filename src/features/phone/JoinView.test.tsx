// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { JoinView } from './JoinView';

afterEach(cleanup);

const baseProps = {
  title: 'Sunday Family Service',
  host: 'mentiqueshie.questlaguna.org',
  joining: false,
  error: null,
  onJoin: () => {},
};

describe('JoinView', () => {
  it('renders the service title as the eyebrow and the welcome heading', () => {
    render(<JoinView {...baseProps} />);
    expect(screen.getByText('Sunday Family Service')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Welcome home.');
  });

  it('asks for no name and no location', () => {
    render(<JoinView {...baseProps} />);
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('calls onJoin when the join button is pressed', () => {
    const onJoin = vi.fn();
    render(<JoinView {...baseProps} onJoin={onJoin} />);
    fireEvent.click(screen.getByRole('button', { name: "Join tonight's question" }));
    expect(onJoin).toHaveBeenCalledTimes(1);
  });

  it('disables the button while joining', () => {
    render(<JoinView {...baseProps} joining />);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows an error when joining fails', () => {
    render(<JoinView {...baseProps} error="Join failed. Retry." />);
    expect(screen.getByRole('alert').textContent).toBe('Join failed. Retry.');
  });

  it('shows the site address in the footer', () => {
    render(<JoinView {...baseProps} />);
    expect(screen.getByText('mentiqueshie.questlaguna.org')).toBeTruthy();
  });
});
