import { describe, expect, it } from 'vitest';
import { Magnesium } from './magnesium';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Magnesium', () => {
  describe('Unit tests', () => {
    it('should be correctly defined', () => {
      const def = Magnesium(400);
      expect(def.molecule.name).toBe('Magnesium');
      expect(def.pk.massMg).toBe(400);
    });

    it('should have moderate bioavailability', () => {
      const def = Magnesium(400);
      expect(def.pk.bioavailability).toBe(0.4);
    });

    it('should antagonize NMDA', () => {
      const def = Magnesium(400);
      const nmdaEffect = def.pd.find(p => p.target === 'NMDA');
      expect(nmdaEffect).toBeDefined();
      expect(nmdaEffect?.mechanism).toBe('antagonist');
    });

    it('should potentiate GABA-A', () => {
      const def = Magnesium(400);
      const gabaEffect = def.pd.find(p => p.target === 'GABA_A');
      expect(gabaEffect).toBeDefined();
      expect(gabaEffect?.mechanism).toBe('PAM');
    });

    it('should reduce cortisol', () => {
      const def = Magnesium(400);
      const cortisolEffect = def.pd.find(p => p.target === 'cortisol');
      expect(cortisolEffect).toBeDefined();
      expect(cortisolEffect?.mechanism).toBe('antagonist');
    });

    it('should boost melatonin', () => {
      const def = Magnesium(400);
      const melatoninEffect = def.pd.find(p => p.target === 'melatonin');
      expect(melatoninEffect).toBeDefined();
      expect(melatoninEffect?.mechanism).toBe('agonist');
    });

    it('should support vagal tone', () => {
      const def = Magnesium(400);
      const vagalEffect = def.pd.find(p => p.target === 'vagal');
      expect(vagalEffect).toBeDefined();
      expect(vagalEffect?.mechanism).toBe('agonist');
    });

    it('should modulate insulin', () => {
      const def = Magnesium(400);
      const insulinEffect = def.pd.find(p => p.target === 'insulin');
      expect(insulinEffect).toBeDefined();
      expect(insulinEffect?.mechanism).toBe('agonist');
    });
  });

  describe('Integration tests', () => {
    it('should reduce cortisol', async () => {
      await ScenarioBuilder.with()
        .duration(1440)
        .taking('magnesium', { mg: 400 }, 1260) // 9 PM
        .expect('cortisol').toFall()
        .run();
    });

    it('should boost melatonin', async () => {
      await ScenarioBuilder.with()
        .duration(1440)
        .taking('magnesium', { mg: 400 }, 1260) // 9 PM
        .expect('melatonin').toRise()
        .run();
    });

    // Note: NMDA and GABA_A are receptor targets that don't exist as simulation signals
    // These effects are verified via unit tests above

    it('should support vagal tone', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('magnesium', { mg: 400 }, 480)
        .expect('vagal').toRise()
        .run();
    });

    it('should modulate insulin', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('magnesium', { mg: 400 }, 480)
        .expect('insulin').toRise()
        .run();
    });
  });
});
