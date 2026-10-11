// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SentView } from './SentView';

afterEach(cleanup);

describe('SentView', () => {
  it('thanks the person and shows what was written', () => {
    render(<SentView text="Hindi Niya ako iiwan." closed={false} onChangeAnswer={() => {}} />);
    expect(screen.getByText('Salamat.')).toBeTruthy();
    expect(screen.getByText('"Hindi Niya ako iiwan."')).toBeTruthy();
  });

  it('offers to change the answer while the question is open', () => {
    const onChangeAnswer = vi.fn();
    render(<SentView text="Peace" closed={false} onChangeAnswer={onChangeAnswer} />);
    fireEvent.click(screen.getByRole('link', { name: 'Change my answer' }));
    expect(onChangeAnswer).toHaveBeenCalledTimes(1);
  });

  it('shows the closed message and no edit link once the question closes', () => {
    render(<SentView text="Peace" closed onChangeAnswer={() => {}} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Salamat. The question is closed.');
    expect(screen.queryByRole('link', { name: 'Change my answer' })).toBeNull();
  });
});
