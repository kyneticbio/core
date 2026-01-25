import { describe, expect, it } from 'vitest';
import { MDMA } from './entactogens';
import { ScenarioBuilder } from '../../../utils/test/scenario-builder';

describe('Agent: MDMA', () => {
  it('should be correctly defined', () => {
    const def = MDMA(100);
    expect(def.molecule.name).toBe('MDMA');
    expect(def.pk.massMg).toBe(100);
  });

  it('should inhibit SERT (serotonin transporter)', () => {
    const def = MDMA(100);
    const sertEffect = def.pd.find(p => p.target === 'SERT');
    expect(sertEffect).toBeDefined();
    expect(sertEffect?.mechanism).toBe('antagonist');
  });

  it('should have high bioavailability', () => {
    const def = MDMA(100);
    expect(def.pk.bioavailability).toBe(0.75);
  });

  it('should have long half-life', () => {
    const def = MDMA(100);
    expect(def.pk.halfLifeMin).toBe(510); // ~8.5 hours
  });

  it('should reach peak around 2 hours', () => {
    const def = MDMA(100);
    expect(def.pk.timeToPeakMin).toBe(120);
  });

  it('should be metabolized by CYP2D6', () => {
    const def = MDMA(100);
    expect(def.pk.clearance?.hepatic?.CYP).toBe('CYP2D6');
  });

  it('should scale effect with dose', () => {
    const low = MDMA(50);
    const high = MDMA(150);

    const lowEffect = low.pd.find(p => p.target === 'SERT')?.intrinsicEfficacy ?? 0;
    const highEffect = high.pd.find(p => p.target === 'SERT')?.intrinsicEfficacy ?? 0;

    expect(highEffect).toBeGreaterThan(lowEffect);
  });

  it('should have large volume of distribution', () => {
    const def = MDMA(100);
    expect(def.pk.volume?.kind).toBe('weight');
    expect((def.pk.volume as any).base_L_kg).toBe(5.0);
  });

  // Note: SERT is a transporter target that doesn't exist as a simulation signal
  // These effects are verified via unit tests above
});
