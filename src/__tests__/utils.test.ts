import { cn } from '../lib/utils';
import { COLORS, RADIUS } from '../lib/tokens';

describe('Utility Functions & Tokens', () => {
  it('cn should merge class names correctly', () => {
    const result = cn('bg-blue-500', 'text-white', false && 'hidden');
    expect(result).toBe('bg-blue-500 text-white');
  });

  it('tokens should contain defined color values', () => {
    expect(COLORS.primary).toBe('#186787');
    expect(RADIUS.lg).toBe(20);
  });
});
