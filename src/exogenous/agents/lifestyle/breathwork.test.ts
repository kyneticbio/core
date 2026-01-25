import { describe, it } from 'vitest';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Breathwork', () => {
  describe('Calm breathing', () => {
    it('should increase vagal tone and reduce norepi', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('breathwork', { type: 'calm', intensity: 1.0 }, 480)
        .expect('vagal').toRise()
        .expect('norepi').toFall()
        .run();
    });

    it('should reduce cortisol', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('breathwork', { type: 'calm', intensity: 1.0 }, 480)
        .expect('cortisol').toFall()
        .run();
    });
  });

  describe('Activation breathing', () => {
    it('should increase norepi and dopamine', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('breathwork', { type: 'activation', intensity: 1.0 }, 480)
        .expect('norepi').toRise()
        .expect('dopamine').toRise()
        .run();
    });

    it('should increase cortisol', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('breathwork', { type: 'activation', intensity: 1.0 }, 480)
        .expect('cortisol').toRise()
        .run();
    });
  });

  describe('Balance breathing', () => {
    it('should moderately increase vagal tone', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('breathwork', { type: 'balance', intensity: 1.0 }, 480)
        .expect('vagal').toRise()
        .run();
    });
  });
});
