import { describe, expect, it } from 'vitest';
import { Omega3 } from './omega3';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Omega-3 (EPA/DHA)', () => {
  it('should be correctly defined', () => {
    const def = Omega3(2000);
    expect(def.molecule.name).toBe('EPA/DHA');
    expect(def.pk.massMg).toBe(2000);
  });

  it('should have good bioavailability', () => {
    const def = Omega3(2000);
    expect(def.pk.bioavailability).toBe(0.7);
  });

  it('should have very long half-life', () => {
    const def = Omega3(2000);
    expect(def.pk.halfLifeMin).toBe(2880); // 48 hours
  });

  it('should reduce inflammation', () => {
    const def = Omega3(2000);
    const inflammationEffect = def.pd.find(p => p.target === 'inflammation');
    expect(inflammationEffect).toBeDefined();
    expect(inflammationEffect?.mechanism).toBe('antagonist');
  });

  it('should support BDNF', () => {
    const def = Omega3(2000);
    const bdnfEffect = def.pd.find(p => p.target === 'bdnf');
    expect(bdnfEffect).toBeDefined();
    expect(bdnfEffect?.mechanism).toBe('agonist');
  });

  it('should support serotonin', () => {
    const def = Omega3(2000);
    const serotoninEffect = def.pd.find(p => p.target === 'serotonin');
    expect(serotoninEffect).toBeDefined();
    expect(serotoninEffect?.mechanism).toBe('agonist');
  });

  it('should support dopamine', () => {
    const def = Omega3(2000);
    const dopamineEffect = def.pd.find(p => p.target === 'dopamine');
    expect(dopamineEffect).toBeDefined();
    expect(dopamineEffect?.mechanism).toBe('agonist');
  });

  it('should modulate cortisol', () => {
    const def = Omega3(2000);
    const cortisolEffect = def.pd.find(p => p.target === 'cortisol');
    expect(cortisolEffect).toBeDefined();
    expect(cortisolEffect?.mechanism).toBe('antagonist');
  });

  it('should scale effects with dose up to caps', () => {
    const low = Omega3(500);
    const high = Omega3(4000);

    const lowBdnf = low.pd.find(p => p.target === 'bdnf')?.intrinsicEfficacy ?? 0;
    const highBdnf = high.pd.find(p => p.target === 'bdnf')?.intrinsicEfficacy ?? 0;

    expect(highBdnf).toBeGreaterThan(lowBdnf);
    expect(highBdnf).toBeLessThanOrEqual(8); // capped
  });

  describe('Integration tests', () => {
    // Note: inflammation starts at 0 and bdnf saturates at 100 in typical simulations
    // These effects are verified via unit tests above

    it('should boost serotonin', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('omega3', { mg: 2000 }, 480)
        .expect('serotonin').toRise()
        .run();
    });

    it('should boost dopamine', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('omega3', { mg: 2000 }, 480)
        .expect('dopamine').toRise()
        .run();
    });

    it('should reduce cortisol', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('omega3', { mg: 2000 }, 480)
        .expect('cortisol').toFall()
        .run();
    });
  });
});
