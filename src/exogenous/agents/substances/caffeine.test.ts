import { describe, it, expect } from 'vitest';
import { Caffeine } from './caffeine';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Caffeine', () => {
  describe('PD Target Coverage', () => {
    it('should define all expected PD targets', () => {
      const def = Caffeine(100);
      const targets = def.pd.map(p => p.target);

      expect(targets).toContain('Adenosine_A2a');
      expect(targets).toContain('Adenosine_A1');
      expect(targets).toContain('cortisol');
      expect(targets).toContain('adrenaline');
      expect(targets).toContain('norepi');
      expect(targets).toContain('ampk');
      expect(targets).toContain('burnRate');
      expect(targets).toHaveLength(7);
    });
  });

  describe('Integration tests', () => {
    // Note: Adenosine_A2a and Adenosine_A1 are receptor targets that don't exist as simulation signals
    // These effects are verified via unit tests above

    it('should increase cortisol', async () => {
      await ScenarioBuilder.with()
        .duration(720)
        .taking('caffeine', { mg: 100 }, 420)
        .expect('cortisol').toRise()
        .run();
    });

    it('should increase adrenaline', async () => {
      await ScenarioBuilder.with()
        .duration(720)
        .taking('caffeine', { mg: 100 }, 420)
        .expect('adrenaline').toRise()
        .run();
    });

    it('should increase norepinephrine', async () => {
      await ScenarioBuilder.with()
        .duration(720)
        .taking('caffeine', { mg: 100 }, 420)
        .expect('norepi').toRise()
        .run();
    });
  });
});
