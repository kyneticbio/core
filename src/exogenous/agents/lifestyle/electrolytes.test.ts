import { describe, expect, it } from 'vitest';
import { Electrolytes } from './electrolytes';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Electrolytes', () => {
  describe('PD Target Coverage', () => {
    it('should define bloodPressure as the PD target', () => {
      const def = Electrolytes(500, 300, 200);
      const targets = def.pd.map(p => p.target);

      expect(targets).toContain('bloodPressure');
      expect(targets).toHaveLength(1);
    });

    it('bloodPressure should be an agonist', () => {
      const def = Electrolytes(500, 300, 200);
      const effect = def.pd.find(p => p.target === 'bloodPressure');
      expect(effect?.mechanism).toBe('agonist');
    });

    it('should have correct unit for bloodPressure', () => {
      const def = Electrolytes(500, 300, 200);
      const effect = def.pd.find(p => p.target === 'bloodPressure');
      expect(effect?.unit).toBe('mmHg');
    });
  });

  describe('PK Parameters', () => {
    it('should be correctly defined with 1-compartment model', () => {
      const def = Electrolytes(500, 300, 200);
      expect(def.molecule.name).toBe('Electrolytes');
      expect(def.pk.model).toBe('1-compartment');
    });

    it('should sum all electrolyte masses', () => {
      const def = Electrolytes(500, 300, 200);
      expect(def.pk.massMg).toBe(1000); // 500 + 300 + 200
    });

    it('should have high bioavailability', () => {
      const def = Electrolytes(500, 300, 200);
      expect(def.pk.bioavailability).toBe(0.9);
    });

    it('should have 4-hour half-life', () => {
      const def = Electrolytes(500, 300, 200);
      expect(def.pk.halfLifeMin).toBe(240);
    });

    it('should peak at 45 minutes', () => {
      const def = Electrolytes(500, 300, 200);
      expect(def.pk.timeToPeakMin).toBe(45);
    });

    it('should distribute in total body water', () => {
      const def = Electrolytes(500, 300, 200);
      expect(def.pk.volume?.kind).toBe('tbw');
    });
  });

  describe('Sodium-dependent blood pressure effect', () => {
    it('should scale blood pressure effect with sodium', () => {
      const lowSodium = Electrolytes(100, 300, 200);
      const highSodium = Electrolytes(1000, 300, 200);

      const lowEffect = lowSodium.pd.find(p => p.target === 'bloodPressure')?.intrinsicEfficacy ?? 0;
      const highEffect = highSodium.pd.find(p => p.target === 'bloodPressure')?.intrinsicEfficacy ?? 0;

      expect(highEffect).toBeGreaterThan(lowEffect);
    });

    it('should calculate bloodPressure effect as sodium * 0.005', () => {
      const def = Electrolytes(500, 300, 200);
      const effect = def.pd.find(p => p.target === 'bloodPressure')?.intrinsicEfficacy ?? 0;
      expect(effect).toBe(500 * 0.005);
    });

    it('potassium and magnesium should not affect BP effect directly', () => {
      const baselinePotassium = Electrolytes(500, 100, 200);
      const highPotassium = Electrolytes(500, 1000, 200);

      const baselineEffect = baselinePotassium.pd.find(p => p.target === 'bloodPressure')?.intrinsicEfficacy ?? 0;
      const highEffect = highPotassium.pd.find(p => p.target === 'bloodPressure')?.intrinsicEfficacy ?? 0;

      expect(baselineEffect).toBe(highEffect); // Only sodium affects BP in this model
    });
  });

  // Note: bloodPressure is not a tracked simulation signal
  // The blood pressure effect is verified via unit tests above
});
