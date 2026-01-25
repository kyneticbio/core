import { describe, expect, it } from 'vitest';
import { LSD, Psilocybin } from './classic';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Classic Psychedelics', () => {
  describe('LSD', () => {
    it('should be correctly defined', () => {
      const def = LSD(100);
      expect(def.molecule.name).toBe('LSD');
      expect(def.pk.massMg).toBe(0.1); // 100mcg = 0.1mg
    });

    it('should target 5HT2A receptor', () => {
      const def = LSD(100);
      const serotoninEffect = def.pd.find(p => p.target === '5HT2A');
      expect(serotoninEffect).toBeDefined();
      expect(serotoninEffect?.mechanism).toBe('agonist');
    });

    it('should have long duration (high half-life)', () => {
      const def = LSD(100);
      expect(def.pk.halfLifeMin).toBe(210); // ~3.5 hours
    });

    it('should have high bioavailability', () => {
      const def = LSD(100);
      expect(def.pk.bioavailability).toBe(0.71);
    });

    it('should scale effect with dose', () => {
      const micro = LSD(10);
      const full = LSD(200);

      const microEffect = micro.pd.find(p => p.target === '5HT2A')?.intrinsicEfficacy ?? 0;
      const fullEffect = full.pd.find(p => p.target === '5HT2A')?.intrinsicEfficacy ?? 0;

      expect(fullEffect).toBeGreaterThan(microEffect);
    });

    it('should be metabolized by CYP3A4', () => {
      const def = LSD(100);
      expect(def.pk.clearance?.hepatic?.CYP).toBe('CYP3A4');
    });
  });

  describe('Psilocybin', () => {
    it('should be correctly defined', () => {
      const def = Psilocybin(25);
      expect(def.molecule.name).toBe('Psilocybin');
      expect(def.pk.massMg).toBe(25);
    });

    it('should target 5HT2A receptor', () => {
      const def = Psilocybin(25);
      const serotoninEffect = def.pd.find(p => p.target === '5HT2A');
      expect(serotoninEffect).toBeDefined();
      expect(serotoninEffect?.mechanism).toBe('agonist');
    });

    it('should have shorter duration than LSD', () => {
      const lsd = LSD(100);
      const psilocybin = Psilocybin(25);
      expect(psilocybin.pk.halfLifeMin!).toBeLessThan(lsd.pk.halfLifeMin!);
    });

    it('should be metabolized by CYP2D6', () => {
      const def = Psilocybin(25);
      expect(def.pk.clearance?.hepatic?.CYP).toBe('CYP2D6');
    });

    it('should scale effect with dose', () => {
      const micro = Psilocybin(0.5);
      const full = Psilocybin(5);

      const microEffect = micro.pd.find(p => p.target === '5HT2A')?.intrinsicEfficacy ?? 0;
      const fullEffect = full.pd.find(p => p.target === '5HT2A')?.intrinsicEfficacy ?? 0;

      expect(fullEffect).toBeGreaterThan(microEffect);
    });
  });

  // Note: 5HT2A is a receptor target that doesn't exist as a simulation signal
  // These effects are verified via unit tests above
});
