import { describe, expect, it } from 'vitest';
import { Melatonin } from './melatonin';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Melatonin', () => {
  describe('Unit tests', () => {
    it('should be correctly defined', () => {
      const def = Melatonin(3);
      expect(def.molecule.name).toBe('Melatonin');
      expect(def.pk.massMg).toBe(3);
    });

    it('should have low bioavailability', () => {
      const def = Melatonin(3);
      expect(def.pk.bioavailability).toBe(0.15);
    });

    it('should have short half-life', () => {
      const def = Melatonin(3);
      expect(def.pk.halfLifeMin).toBe(45);
    });

    it('should activate MT1 receptors', () => {
      const def = Melatonin(3);
      const mt1Effect = def.pd.find(p => p.target === 'MT1');
      expect(mt1Effect).toBeDefined();
      expect(mt1Effect?.mechanism).toBe('agonist');
    });

    it('should activate MT2 receptors', () => {
      const def = Melatonin(3);
      const mt2Effect = def.pd.find(p => p.target === 'MT2');
      expect(mt2Effect).toBeDefined();
      expect(mt2Effect?.mechanism).toBe('agonist');
    });

    it('should suppress orexin', () => {
      const def = Melatonin(3);
      const orexinEffect = def.pd.find(p => p.target === 'orexin');
      expect(orexinEffect).toBeDefined();
      expect(orexinEffect?.mechanism).toBe('antagonist');
    });

    it('should reduce cortisol', () => {
      const def = Melatonin(3);
      const cortisolEffect = def.pd.find(p => p.target === 'cortisol');
      expect(cortisolEffect).toBeDefined();
      expect(cortisolEffect?.mechanism).toBe('antagonist');
    });

    it('should potentiate GABA-A', () => {
      const def = Melatonin(3);
      const gabaEffect = def.pd.find(p => p.target === 'GABA_A');
      expect(gabaEffect).toBeDefined();
      expect(gabaEffect?.mechanism).toBe('PAM');
    });
  });

  describe('Integration tests', () => {
    // Note: MT1, MT2, and GABA_A are receptor targets that don't exist as simulation signals
    // These effects are verified via unit tests above

    it('should suppress orexin', async () => {
      await ScenarioBuilder.with()
        .duration(1440)
        .taking('melatonin', { mg: 3 }, 1320) // 10 PM
        .expect('orexin').toFall()
        .run();
    });

    it('should reduce cortisol', async () => {
      await ScenarioBuilder.with()
        .duration(1440)
        .taking('melatonin', { mg: 3 }, 1320) // 10 PM
        .expect('cortisol').toFall()
        .run();
    });
  });
});
