import { describe, expect, it } from 'vitest';
import { anxiety } from './anxiety';
import { buildConditionAdjustments } from '../utils';
import { createConditionState } from '../test-utils';

describe('Anxiety Condition', () => {
  it('is correctly defined', () => {
    expect(anxiety.key).toBe('anxiety');
  });

  it('reduces GABA-A receptor density', () => {
    const state = createConditionState({
      anxiety: { enabled: true, params: { reactivity: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    expect(adjustments.receptorDensities['GABA_A']).toBeLessThan(0);
  });

  it('reduces MAO-A activity', () => {
    const state = createConditionState({
      anxiety: { enabled: true, params: { reactivity: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    expect(adjustments.enzymeActivities['MAO_A']).toBeLessThan(0);
  });

  describe('Monotonicity', () => {
    it('GABA-A density decreases monotonically with reactivity', () => {
      const reactivities = [0.2, 0.4, 0.6, 0.8, 1.0];
      const gabaDensities = reactivities.map(reactivity => {
        const adj = buildConditionAdjustments(
          createConditionState({ anxiety: { enabled: true, params: { reactivity } } })
        );
        return adj.receptorDensities['GABA_A'] ?? 0;
      });

      for (let i = 1; i < gabaDensities.length; i++) {
        expect(gabaDensities[i]).toBeLessThan(gabaDensities[i - 1]);
      }
    });

    it('Alpha1 sensitivity increases monotonically with reactivity', () => {
      const reactivities = [0.2, 0.4, 0.6, 0.8, 1.0];
      const sensitivities = reactivities.map(reactivity => {
        const adj = buildConditionAdjustments(
          createConditionState({ anxiety: { enabled: true, params: { reactivity } } })
        );
        return adj.receptorSensitivities['Alpha1'] ?? 0;
      });

      for (let i = 1; i < sensitivities.length; i++) {
        expect(sensitivities[i]).toBeGreaterThan(sensitivities[i - 1]);
      }
    });
  });
});
