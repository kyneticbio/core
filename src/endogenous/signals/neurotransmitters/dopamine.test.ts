import { describe, it, expect } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Signal: Dopamine', () => {
  it('should have a morning rise', async () => {
    const result = await ScenarioBuilder.with()
      .duration(1440)
      .run();

    // 10:30 AM is peak in definition (hourToPhase(10.5))
    // 4 AM (240 min) should be lower than 10:30 AM (630 min)
    const early = result.signals.dopamine[Math.floor(240 / 5)];
    const peak = result.signals.dopamine[Math.floor(630 / 5)];

    // Expecting morning rise
    expect(peak).toBeGreaterThan(early);
  });
});
