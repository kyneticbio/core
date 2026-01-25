import { describe, expect, it } from 'vitest';
import { Ketamine } from './dissociatives';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: Ketamine', () => {
  it('should be correctly defined', () => {
    const def = Ketamine(50);
    expect(def.molecule.name).toBe('Ketamine');
    expect(def.pk.massMg).toBe(50);
  });

  it('should antagonize NMDA receptor', () => {
    const def = Ketamine(50);
    const nmdaEffect = def.pd.find(p => p.target === 'NMDA');
    expect(nmdaEffect).toBeDefined();
    expect(nmdaEffect?.mechanism).toBe('antagonist');
  });

  describe('Route-dependent pharmacokinetics', () => {
    it('intranasal should have moderate bioavailability and fast onset', () => {
      const def = Ketamine(50, 'intranasal');
      expect(def.pk.bioavailability).toBe(0.45);
      expect(def.pk.timeToPeakMin).toBe(20);
    });

    it('sublingual should have lower bioavailability', () => {
      const def = Ketamine(50, 'sublingual');
      expect(def.pk.bioavailability).toBe(0.3);
      expect(def.pk.timeToPeakMin).toBe(30);
    });

    it('IV should have 100% bioavailability and fastest onset', () => {
      const def = Ketamine(50, 'iv');
      expect(def.pk.bioavailability).toBe(1.0);
      expect(def.pk.timeToPeakMin).toBe(5);
      expect(def.pk.delivery).toBe('infusion');
    });

    it('IM should have high bioavailability', () => {
      const def = Ketamine(50, 'im');
      expect(def.pk.bioavailability).toBe(0.93);
      expect(def.pk.timeToPeakMin).toBe(15);
    });
  });

  it('should be metabolized by CYP3A4', () => {
    const def = Ketamine(50);
    expect(def.pk.clearance?.hepatic?.CYP).toBe('CYP3A4');
  });

  it('should scale effect with dose', () => {
    const low = Ketamine(25);
    const high = Ketamine(100);

    const lowEffect = low.pd.find(p => p.target === 'NMDA')?.intrinsicEfficacy ?? 0;
    const highEffect = high.pd.find(p => p.target === 'NMDA')?.intrinsicEfficacy ?? 0;

    expect(highEffect).toBeGreaterThan(lowEffect);
  });

  // Note: NMDA is a receptor target that doesn't exist as a simulation signal
  // These effects are verified via unit tests above
});
