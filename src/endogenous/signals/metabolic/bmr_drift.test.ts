
import { describe, it, expect } from 'vitest';
import { createInitialState, integrateStep, DEFAULT_SUBJECT, derivePhysiology, AUXILIARY_DEFINITIONS } from '../../../index';

describe('Metabolic Drift (BMR Scaling)', () => {
  const subject = DEFAULT_SUBJECT;
  const physiology = derivePhysiology(subject);
  const ctx = { 
    subject, 
    physiology, 
    minuteOfDay: 480, // 8 AM
    circadianMinuteOfDay: 480, 
    dayOfYear: 1, 
    isAsleep: false 
  };

  const SIM_DURATION = 120; // 2 hours

  function getConvergedBurnRate(muscleDelta: number, fatDelta: number): number {
    let state = createInitialState(ctx);

    // Inject body composition changes
    state.auxiliary.muscleMass = muscleDelta;
    state.auxiliary.fatMass = fatDelta;

    // Run to convergence
    for (let i = 0; i < SIM_DURATION; i++) {
      state = integrateStep(state, 480, 1.0, ctx, undefined, undefined, []);
    }

    return state.signals.burnRate;
  }

  it('Burn rate should increase with muscle mass', () => {
    const baseline = getConvergedBurnRate(0, 0);
    const withMuscle = getConvergedBurnRate(10, 0); // +10kg muscle

    console.log(`Baseline Burn: ${baseline.toFixed(4)} kcal/min`);
    console.log(`+10kg Muscle Burn: ${withMuscle.toFixed(4)} kcal/min`);

    expect(withMuscle).toBeGreaterThan(baseline);
    
    // Check magnitude: 10kg * 13kcal = 130kcal/day => ~0.09 kcal/min
    const diff = withMuscle - baseline;
    expect(diff).toBeCloseTo(0.09, 2); 
  });

  it('Burn rate should increase with fat mass, but less than muscle', () => {
    const baseline = getConvergedBurnRate(0, 0);
    const withFat = getConvergedBurnRate(0, 10); // +10kg fat

    console.log(`+10kg Fat Burn: ${withFat.toFixed(4)} kcal/min`);

    expect(withFat).toBeGreaterThan(baseline);
    
    // Check magnitude: 10kg * 4.5kcal = 45kcal/day => ~0.03 kcal/min
    const diff = withFat - baseline;
    expect(diff).toBeCloseTo(0.03, 2);
  });

  it('Muscle should burn ~3x more calories per kg than fat', () => {
    const baseline = getConvergedBurnRate(0, 0);
    const muscleGain = getConvergedBurnRate(10, 0) - baseline;
    const fatGain = getConvergedBurnRate(0, 10) - baseline;

    const ratio = muscleGain / fatGain;
    console.log(`Muscle/Fat Metabolic Ratio: ${ratio.toFixed(2)}`);

    // Ratio of 13 / 4.5 is approx 2.88
    expect(ratio).toBeGreaterThan(2.5);
    expect(ratio).toBeLessThan(3.5);
  });
});
