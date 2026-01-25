import { describe, expect, it } from 'vitest';
import { VitaminD, BComplex } from './vitamins';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Vitamins', () => {
  describe('Vitamin D (D3)', () => {
    it('should be correctly defined', () => {
      const def = VitaminD(5000);
      expect(def.molecule.name).toBe('Cholecalciferol');
    });

    it('should convert IU to mcg correctly', () => {
      const def = VitaminD(4000);
      // 4000 IU * 0.025 = 100 mcg = 0.1 mg
      expect(def.pk.massMg).toBe(0.1);
    });

    it('should have good bioavailability', () => {
      const def = VitaminD(5000);
      expect(def.pk.bioavailability).toBe(0.8);
    });

    it('should have very long half-life', () => {
      const def = VitaminD(5000);
      expect(def.pk.halfLifeMin).toBe(20160); // ~14 days
    });

    it('should target vitamin D3 levels', () => {
      const def = VitaminD(5000);
      const vitDEffect = def.pd.find(p => p.target === 'vitaminD3');
      expect(vitDEffect).toBeDefined();
      expect(vitDEffect?.mechanism).toBe('agonist');
    });

    it('should scale effect with dose', () => {
      const low = VitaminD(1000);
      const high = VitaminD(10000);

      const lowEffect = low.pd.find(p => p.target === 'vitaminD3')?.intrinsicEfficacy ?? 0;
      const highEffect = high.pd.find(p => p.target === 'vitaminD3')?.intrinsicEfficacy ?? 0;

      expect(highEffect).toBeGreaterThan(lowEffect);
    });
  });

  describe('B-Complex', () => {
    it('should be correctly defined', () => {
      const def = BComplex(500, 400);
      expect(def.molecule.name).toBe('B-Complex');
    });

    it('should have moderate bioavailability', () => {
      const def = BComplex(500, 400);
      expect(def.pk.bioavailability).toBe(0.5);
    });

    it('should target B12 levels', () => {
      const def = BComplex(500, 400);
      const b12Effect = def.pd.find(p => p.target === 'b12');
      expect(b12Effect).toBeDefined();
      expect(b12Effect?.mechanism).toBe('agonist');
    });

    it('should target folate levels', () => {
      const def = BComplex(500, 400);
      const folateEffect = def.pd.find(p => p.target === 'folate');
      expect(folateEffect).toBeDefined();
      expect(folateEffect?.mechanism).toBe('agonist');
    });

    it('should use default values when not specified', () => {
      const def = BComplex();
      expect(def.pk.massMg).toBe(0.9); // (500 + 400) / 1000
    });

    it('should scale B12 effect with dose up to cap', () => {
      const low = BComplex(100, 400);
      const high = BComplex(2000, 400);

      const lowB12 = low.pd.find(p => p.target === 'b12')?.intrinsicEfficacy ?? 0;
      const highB12 = high.pd.find(p => p.target === 'b12')?.intrinsicEfficacy ?? 0;

      expect(highB12).toBeGreaterThan(lowB12);
      expect(highB12).toBeLessThanOrEqual(200); // capped
    });
  });

  describe('Integration tests', () => {
    it('Vitamin D: should boost vitaminD3 levels', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('vitaminD', { iu: 5000 }, 480)
        .expect('vitaminD3').toRise()
        .run();
    });

    it('B-Complex: should boost B12 levels', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('bComplex', { b12Mcg: 500, folateMcg: 400 }, 480)
        .expect('b12').toRise()
        .run();
    });

    it('B-Complex: should boost folate levels', async () => {
      await ScenarioBuilder.with()
        .duration(600)
        .taking('bComplex', { b12Mcg: 500, folateMcg: 400 }, 480)
        .expect('folate').toRise()
        .run();
    });
  });
});
