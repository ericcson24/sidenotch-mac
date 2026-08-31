import { describe, it, expect } from 'vitest';

describe('Workspace Context & Utilities', () => {
  it('should correctly format folder names from POSIX paths', () => {
    const fullPath = '/Users/eric/Desktop/Applicacion Sidebar';
    const folderName = fullPath.split('/').filter(Boolean).pop();
    expect(folderName).toBe('Applicacion Sidebar');
  });

  it('should calculate quota percentages safely', () => {
    const calcPercent = (used: number, limit: number) => {
      if (!limit || limit <= 0) return 100;
      return Math.max(0, Math.min(100, Math.round(((limit - used) / limit) * 100)));
    };

    expect(calcPercent(20, 100)).toBe(80);
    expect(calcPercent(0, 100)).toBe(100);
    expect(calcPercent(120, 100)).toBe(0);
    expect(calcPercent(5, 0)).toBe(100);
  });
});
