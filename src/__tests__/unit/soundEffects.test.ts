import { describe, it, expect } from 'vitest';
import { sounds } from '../../utils/soundEffects';

describe('Sound Effects Utility (Audio Engine)', () => {
  it('should safely execute all sound triggers without throwing in any environment', () => {
    expect(() => sounds.playHoverTick()).not.toThrow();
    expect(() => sounds.playIslandExpand()).not.toThrow();
    expect(() => sounds.playIslandCollapse()).not.toThrow();
    expect(() => sounds.playShutter()).not.toThrow();
    expect(() => sounds.playColorCopy()).not.toThrow();
  });
});
