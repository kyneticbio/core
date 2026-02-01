import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Over-hydration and Rapid Intake', () => {
  it('should allow hydration to exceed 100% and trigger over-hydration warning', async () => {
    await ScenarioBuilder.with({ weight: 70 })
      .duration(120) // 2 hours
      .add('water', { params: { ml: 1000 }, start: 10, duration: 10 })
      .add('water', { params: { ml: 1000 }, start: 30, duration: 10 })
      .expect('hydration')
      .toPeakAbove(100)
      .expect('hydration')
      .toTriggerMonitor('hydration_overhydration')
      .run();
  });

  it('should trigger warning when drinking too much too fast', async () => {
    await ScenarioBuilder.with({ weight: 70 })
      .duration(60)
      .add('water', { params: { ml: 2000 }, start: 5, duration: 5 })
      .expect('hydration')
      .toTriggerMonitor('hydration_too_fast')
      .run();
  });
});

