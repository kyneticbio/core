import { describe, expect, it } from 'vitest';
import { Creatine, LCarnitine, CDPCholine } from './performance';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Performance Supplements', () => {
  describe('Creatine', () => {
    it('should be correctly defined', () => {
      const def = Creatine(5);
      expect(def.molecule.name).toBe('Creatine');
      expect(def.pk.massMg).toBe(5000); // 5 grams
    });

    it('should have very high bioavailability', () => {
      const def = Creatine(5);
      expect(def.pk.bioavailability).toBe(0.95);
    });

    it('should boost energy index', () => {
      const def = Creatine(5);
      const energyEffect = def.pd.find(p => p.target === 'energy');
      expect(energyEffect).toBeDefined();
      expect(energyEffect?.mechanism).toBe('agonist');
    });

    it('should scale effect with dose up to cap', () => {
      const low = Creatine(2);
      const high = Creatine(10);

      const lowEnergy = low.pd.find(p => p.target === 'energy')?.intrinsicEfficacy ?? 0;
      const highEnergy = high.pd.find(p => p.target === 'energy')?.intrinsicEfficacy ?? 0;

      expect(highEnergy).toBeGreaterThan(lowEnergy);
      expect(highEnergy).toBeLessThanOrEqual(0.1); // capped
    });
  });

  describe('L-Carnitine (ALCAR)', () => {
    it('should be correctly defined', () => {
      const def = LCarnitine(500);
      expect(def.molecule.name).toBe('Acetyl-L-Carnitine');
      expect(def.pk.massMg).toBe(500);
    });

    it('should have low bioavailability', () => {
      const def = LCarnitine(500);
      expect(def.pk.bioavailability).toBe(0.15);
    });

    it('should boost energy index', () => {
      const def = LCarnitine(500);
      const energyEffect = def.pd.find(p => p.target === 'energy');
      expect(energyEffect).toBeDefined();
      expect(energyEffect?.mechanism).toBe('agonist');
    });
  });

  describe('CDP-Choline (Citicoline)', () => {
    it('should be correctly defined', () => {
      const def = CDPCholine(250);
      expect(def.molecule.name).toBe('Citicoline');
      expect(def.pk.massMg).toBe(250);
    });

    it('should have high bioavailability', () => {
      const def = CDPCholine(250);
      expect(def.pk.bioavailability).toBe(0.9);
    });

    it('should boost choline levels', () => {
      const def = CDPCholine(250);
      const cholineEffect = def.pd.find(p => p.target === 'choline');
      expect(cholineEffect).toBeDefined();
      expect(cholineEffect?.mechanism).toBe('agonist');
    });

    it('should scale effect with dose up to cap', () => {
      const low = CDPCholine(250);
      const high = CDPCholine(1000);

      const lowCholine = low.pd.find(p => p.target === 'choline')?.intrinsicEfficacy ?? 0;
      const highCholine = high.pd.find(p => p.target === 'choline')?.intrinsicEfficacy ?? 0;

      expect(highCholine).toBeGreaterThan(lowCholine);
      expect(highCholine).toBeLessThanOrEqual(8); // capped
    });
  });

  describe('Integration tests', () => {
    // Note: energy signal saturates at 150 in typical simulations
    // Creatine and L-Carnitine energy effects are verified via unit tests above

    it('CDP-Choline: should boost choline', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('cdpCholine', { mg: 250 }, 480)
        .expect('choline').toRise()
        .run();
    });
  });
});
