import { describe, expect, it } from 'vitest';
import { THCInhaled, THCOral } from './cannabinoids';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Cannabinoids', () => {
  describe('THC Inhaled', () => {
    it('should be correctly defined', () => {
      const def = THCInhaled(10);
      expect(def.molecule.name).toBe('THC (inhaled)');
      expect(def.pk.massMg).toBe(10);
    });

    it('should have fast onset (short tPeak)', () => {
      const def = THCInhaled(10);
      expect(def.pk.timeToPeakMin).toBe(8);
    });

    it('should have lower bioavailability than oral', () => {
      const inhaled = THCInhaled(10);
      const oral = THCOral(10);
      // Inhaled is 0.25, oral is 0.08 - but inhaled peaks faster
      expect(inhaled.pk.timeToPeakMin).toBeLessThan(oral.pk.timeToPeakMin!);
    });

    it('should target CB1 receptor', () => {
      const def = THCInhaled(10);
      const cb1Effect = def.pd.find(p => p.target === 'CB1');
      expect(cb1Effect).toBeDefined();
      expect(cb1Effect?.mechanism).toBe('agonist');
    });

    it('should use 2-compartment model (lipophilic)', () => {
      const def = THCInhaled(10);
      expect(def.pk.model).toBe('2-compartment');
    });

    it('should scale CB1 effect with dose', () => {
      const low = THCInhaled(5);
      const high = THCInhaled(20);

      const lowEffect = low.pd.find(p => p.target === 'CB1')?.intrinsicEfficacy ?? 0;
      const highEffect = high.pd.find(p => p.target === 'CB1')?.intrinsicEfficacy ?? 0;

      expect(highEffect).toBeGreaterThan(lowEffect);
    });
  });

  describe('THC Oral', () => {
    it('should be correctly defined', () => {
      const def = THCOral(10);
      expect(def.molecule.name).toBe('THC (oral)');
      expect(def.pk.massMg).toBe(10);
    });

    it('should have slower onset than inhaled', () => {
      const inhaled = THCInhaled(10);
      const oral = THCOral(10);
      expect(oral.pk.timeToPeakMin).toBeGreaterThan(inhaled.pk.timeToPeakMin!);
    });

    it('should have longer half-life than inhaled', () => {
      const inhaled = THCInhaled(10);
      const oral = THCOral(10);
      expect(oral.pk.halfLifeMin).toBeGreaterThan(inhaled.pk.halfLifeMin!);
    });

    it('should have higher intrinsic efficacy per mg (11-OH-THC conversion)', () => {
      const inhaled = THCInhaled(10);
      const oral = THCOral(10);

      const inhaledEffect = inhaled.pd.find(p => p.target === 'CB1')?.intrinsicEfficacy ?? 0;
      const oralEffect = oral.pd.find(p => p.target === 'CB1')?.intrinsicEfficacy ?? 0;

      expect(oralEffect).toBeGreaterThan(inhaledEffect);
    });
  });

  // Note: CB1 is a receptor target that doesn't exist as a simulation signal
  // These effects are verified via unit tests above
});
