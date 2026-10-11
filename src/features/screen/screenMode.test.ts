import { describe, expect, it } from 'vitest';
import { resolveScreenMode } from './screenMode';

describe('resolveScreenMode', () => {
  it('shows the chosen view while the question is open', () => {
    expect(resolveScreenMode({ questionStatus: 'open', screenView: 'cloud' })).toBe('cloud');
    expect(resolveScreenMode({ questionStatus: 'open', screenView: 'wall' })).toBe('wall');
  });

  it('shows the join view when no question is open', () => {
    expect(resolveScreenMode({ questionStatus: 'hidden', screenView: 'cloud' })).toBe('join');
    expect(resolveScreenMode({ questionStatus: 'closed', screenView: 'wall' })).toBe('join');
  });

  it('goes black on blank, whatever the question status', () => {
    expect(resolveScreenMode({ questionStatus: 'open', screenView: 'blank' })).toBe('blank');
    expect(resolveScreenMode({ questionStatus: 'hidden', screenView: 'blank' })).toBe('blank');
  });
});
