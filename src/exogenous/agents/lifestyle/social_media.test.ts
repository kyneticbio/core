import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Social Media', () => {
  describe('Doomscrolling', () => {
    it('should spike dopamine and cortisol', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('social_media', { type: 'doomscrolling' }, 480)
        .expect('dopamine').toRise()
        .expect('cortisol').toRise()
        .run();
    });

    it('should suppress serotonin', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('social_media', { type: 'doomscrolling' }, 480)
        .expect('serotonin').toFall()
        .run();
    });
  });

  describe('Entertainment', () => {
    it('should increase dopamine with less cortisol than doomscrolling', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('social_media', { type: 'entertainment' }, 480)
        .expect('dopamine').toRise()
        .run();
    });

    it('should increase orexin (alertness)', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('social_media', { type: 'entertainment' }, 480)
        .expect('orexin').toRise()
        .run();
    });
  });
});
