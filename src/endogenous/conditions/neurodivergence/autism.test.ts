import { describe, expect, it } from 'vitest';
import { autism } from './autism';
import { buildConditionAdjustments } from '../utils';
import { createConditionState } from '../test-utils';

describe('Autism Condition', () => {
  it('is correctly defined', () => {
    expect(autism.key).toBe('autism');
  });

  it('reduces GABA-A receptor density (E/I imbalance)', () => {
    const state = createConditionState({
      autism: { enabled: true, params: { eibalance: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    expect(adjustments.receptorDensities['GABA_A']).toBeLessThan(0);
  });

  it('reduces oxytocin receptor density', () => {
    const state = createConditionState({
      autism: { enabled: true, params: { eibalance: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    expect(adjustments.receptorDensities['OXTR']).toBeLessThan(0);
  });

  it('reduces SERT activity (hyperserotonemia)', () => {
    const state = createConditionState({
      autism: { enabled: true, params: { eibalance: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    // Reduced SERT = slower serotonin clearance = higher serotonin
    expect(adjustments.transporterActivities['SERT']).toBeLessThan(0);
  });

  describe('Monotonicity', () => {
    it('GABA-A density decreases monotonically with E/I imbalance', () => {
      const balances = [0.2, 0.4, 0.6, 0.8, 1.0];
      const densities = balances.map(eibalance => {
        const adj = buildConditionAdjustments(
          createConditionState({ autism: { enabled: true, params: { eibalance } } })
        );
        return adj.receptorDensities['GABA_A'] ?? 0;
      });

      for (let i = 1; i < densities.length; i++) {
        expect(densities[i]).toBeLessThan(densities[i - 1]);
      }
    });

    it('OXTR density decreases monotonically with E/I imbalance', () => {
      const balances = [0.2, 0.4, 0.6, 0.8, 1.0];
      const densities = balances.map(eibalance => {
        const adj = buildConditionAdjustments(
          createConditionState({ autism: { enabled: true, params: { eibalance } } })
        );
        return adj.receptorDensities['OXTR'] ?? 0;
      });

      for (let i = 1; i < densities.length; i++) {
        expect(densities[i]).toBeLessThan(densities[i - 1]);
      }
    });
  });
});
