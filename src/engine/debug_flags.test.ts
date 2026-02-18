import { describe, it, expect } from 'vitest';
import { computeDerivatives, initializeZeroState } from '../index';
import { dopamine } from '../endogenous/signals';
import { DEFAULT_SUBJECT, derivePhysiology } from '../index';
import type { DynamicsContext } from '../index';

describe('Solver Debug Flags (Optimized V2)', () => {
  const subject = DEFAULT_SUBJECT;
  const physiology = derivePhysiology(subject);
  const ctx: DynamicsContext = {
    minuteOfDay: 480, // 8 AM
    circadianMinuteOfDay: 480, // 8 AM
    dayOfYear: 1,
    isAsleep: false,
    subject,
    physiology
  };

  const definitions = { dopamine };

  it('should have non-zero setpoint when baselines enabled', () => {
    const state = initializeZeroState();
    const derivs = computeDerivatives(
      state,
      480,
      ctx,
      definitions,
      {},
      [],
      { debug: { enableBaselines: true } }
    );
    // Dopamine setpoint is non-zero at 8AM
    expect(derivs.signals.dopamine).toBeGreaterThan(0.09);
  });

  it('should have zero setpoint contribution when baselines disabled', () => {
    const state = initializeZeroState();
    const derivs = computeDerivatives(
      state,
      480,
      ctx,
      definitions,
      {},
      [],
      { debug: { enableBaselines: false } }
    );

    expect(derivs.signals.dopamine).toBe(0);
  });
});
