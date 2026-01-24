import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Condition: PCOS', () => {
  it('should result in higher baseline testosterone', async () => {
    // PCOS models higher androgen baselines
    await ScenarioBuilder.with()
      .condition('pcos', { severity: 1.0 })
      .duration(120)
      .expect('testosterone').toPeakAbove(30) // Baseline is usually around 20-30 for generic subject
      .run();
  });
});
