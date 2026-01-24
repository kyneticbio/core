import { describe, expect, it } from 'vitest';
import { insomnia } from './insomnia';
import { buildConditionAdjustments } from '../utils';
import { createConditionState } from '../test-utils';

describe('Insomnia Condition', () => {
  it('is correctly defined', () => {
    expect(insomnia.key).toBe('insomnia');
  });

  it('increases orexin receptor sensitivity', () => {
    const state = createConditionState({
      insomnia: { enabled: true, params: { severity: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    expect(adjustments.receptorSensitivities['OX2R']).toBeGreaterThan(0);
  });

  it('reduces melatonin receptor density', () => {
    const state = createConditionState({
      insomnia: { enabled: true, params: { severity: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    expect(adjustments.receptorDensities['MT1']).toBeLessThan(0);
  });

  describe('Monotonicity', () => {
    it('OX2R sensitivity increases monotonically with severity', () => {
      const severities = [0.2, 0.4, 0.6, 0.8, 1.0];
      const sensitivities = severities.map(severity => {
        const adj = buildConditionAdjustments(
          createConditionState({ insomnia: { enabled: true, params: { severity } } })
        );
        return adj.receptorSensitivities['OX2R'] ?? 0;
      });

      for (let i = 1; i < sensitivities.length; i++) {
        expect(sensitivities[i]).toBeGreaterThan(sensitivities[i - 1]);
      }
    });

    it('MT1 density decreases monotonically with severity', () => {
      const severities = [0.2, 0.4, 0.6, 0.8, 1.0];
      const densities = severities.map(severity => {
        const adj = buildConditionAdjustments(
          createConditionState({ insomnia: { enabled: true, params: { severity } } })
        );
        return adj.receptorDensities['MT1'] ?? 0;
      });

      for (let i = 1; i < densities.length; i++) {
        expect(densities[i]).toBeLessThan(densities[i - 1]);
      }
    });
  });
});
