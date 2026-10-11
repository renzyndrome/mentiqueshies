// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AnswerView } from './AnswerView';

afterEach(cleanup);

const baseProps = {
  questionText: 'What is one promise from God you are holding on to this week?',
  initialText: '',
  sending: false,
  error: null,
  onSubmit: () => {},
};

const textarea = () => screen.getByRole('textbox', { name: 'Your answer' }) as HTMLTextAreaElement;

describe('AnswerView', () => {
  it('shows the question', () => {
    render(<AnswerView {...baseProps} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(baseProps.questionText);
  });

  it('starts the counter at 0 / 80', () => {
    render(<AnswerView {...baseProps} />);
    expect(screen.getByText('0 / 80')).toBeTruthy();
  });

  it('updates the counter while typing', () => {
    render(<AnswerView {...baseProps} />);
    fireEvent.change(textarea(), { target: { value: 'Faithful' } });
    expect(screen.getByText('8 / 80')).toBeTruthy();
  });

  it('counts an accented letter once', () => {
    render(<AnswerView {...baseProps} />);
    fireEvent.change(textarea(), { target: { value: 'Biñan' } });
    expect(screen.getByText('5 / 80')).toBeTruthy();
  });

  it('limits the field to 80 characters', () => {
    render(<AnswerView {...baseProps} />);
    expect(textarea().maxLength).toBe(80);
  });

  it('prefills the previous answer and counts it', () => {
    render(<AnswerView {...baseProps} initialText="Hindi Niya ako iiwan." />);
    expect(textarea().value).toBe('Hindi Niya ako iiwan.');
    expect(screen.getByText('21 / 80')).toBeTruthy();
  });

  it('keeps send disabled until there is text', () => {
    render(<AnswerView {...baseProps} />);
    const send = screen.getByRole('button', { name: 'Send my answer' }) as HTMLButtonElement;
    expect(send.disabled).toBe(true);
    fireEvent.change(textarea(), { target: { value: '   ' } });
    expect(send.disabled).toBe(true);
    fireEvent.change(textarea(), { target: { value: 'Peace' } });
    expect(send.disabled).toBe(false);
  });

  it('submits the trimmed answer', () => {
    const onSubmit = vi.fn();
    render(<AnswerView {...baseProps} onSubmit={onSubmit} />);
    fireEvent.change(textarea(), { target: { value: '  Faithful  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send my answer' }));
    expect(onSubmit).toHaveBeenCalledWith('Faithful');
  });

  it('shows no footer line, name toggle or suggestion chips', () => {
    render(<AnswerView {...baseProps} />);
    expect(screen.queryByText(/media team/)).toBeNull();
    expect(screen.queryByText(/Show my name/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Peace' })).toBeNull();
  });

  it('shows a send error', () => {
    render(<AnswerView {...baseProps} error="Sending too fast. Retry in 2 seconds." />);
    expect(screen.getByRole('alert').textContent).toBe('Sending too fast. Retry in 2 seconds.');
  });
});
