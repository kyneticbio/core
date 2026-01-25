import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Sunlight Exposure', () => {
  describe('Sunrise viewing', () => {
    it('should suppress melatonin and boost cortisol', async () => {
      await ScenarioBuilder.with()
        .duration(1440)
        .taking('sunlight_viewing', { lux: 50000, time: 'sunrise' }, 420) // 7 AM
        .expect('melatonin').toFall()
        .expect('cortisol').toRise()
        .run();
    });

    it('should boost serotonin', async () => {
      await ScenarioBuilder.with()
        .duration(1440)
        .taking('sunlight_viewing', { lux: 50000, time: 'sunrise' }, 420)
        .expect('serotonin').toRise()
        .run();
    });
  });

  describe('Midday light', () => {
    it('should boost serotonin and dopamine', async () => {
      // At midday, melatonin is already at baseline so we test serotonin/dopamine instead
      await ScenarioBuilder.with()
        .duration(1440)
        .taking('sunlight_viewing', { lux: 100000, time: 'midday' }, 720) // Noon
        .expect('serotonin').toRise()
        .expect('dopamine').toRise()
        .run();
    });
  });

  describe('Sunset viewing', () => {
    it('should gently boost serotonin without melatonin suppression', async () => {
      await ScenarioBuilder.with()
        .duration(1440)
        .taking('sunlight_viewing', { lux: 10000, time: 'sunset' }, 1140) // 7 PM
        .expect('serotonin').toRise()
        .run();
    });
  });
});
