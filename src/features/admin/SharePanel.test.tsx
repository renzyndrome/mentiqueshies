// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SharePanel } from './SharePanel';
import { buildShareLinks } from './shareLinks';

afterEach(cleanup);

describe('buildShareLinks', () => {
  it('builds screen and answer links from the public address', () => {
    expect(buildShareLinks('https://example.org/').map((link) => link.url)).toEqual([
      'https://example.org/screen',
      'https://example.org/answer',
    ]);
  });
});

describe('SharePanel', () => {
  it('shows both links', () => {
    render(<SharePanel publicUrl="https://example.org" />);
    expect((screen.getByLabelText('Big screen link') as HTMLInputElement).value).toBe('https://example.org/screen');
    expect((screen.getByLabelText('Phone answer page link') as HTMLInputElement).value).toBe(
      'https://example.org/answer',
    );
  });

  it('copies the screen link and confirms', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<SharePanel publicUrl="https://example.org" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy Big screen link' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Copied.'));
    expect(writeText).toHaveBeenCalledWith('https://example.org/screen');
  });
});
