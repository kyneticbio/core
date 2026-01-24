import { describe, expect, it } from 'vitest';
import { mcas } from './mcas';
import { buildConditionAdjustments } from '../utils';
import { createConditionState } from '../test-utils';

describe('MCAS Condition', () => {
  it('is correctly defined', () => {
    expect(mcas.key).toBe('mcas');
  });

  it('reduces DAO enzyme activity', () => {
    const state = createConditionState({
      mcas: { enabled: true, params: { activation: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    expect(adjustments.enzymeActivities['DAO']).toBeLessThan(0);
  });

  describe('Monotonicity', () => {
    it('DAO activity decreases (more negative) monotonically with activation', () => {
      const activations = [0.2, 0.4, 0.6, 0.8, 1.0];
      const daoActivities = activations.map(activation => {
        const adj = buildConditionAdjustments(
          createConditionState({ mcas: { enabled: true, params: { activation } } })
        );
        return adj.enzymeActivities['DAO'] ?? 0;
      });

      // DAO should become more negative with activation
      for (let i = 1; i < daoActivities.length; i++) {
        expect(daoActivities[i]).toBeLessThan(daoActivities[i - 1]);
      }
    });

    it('H1 sensitivity increases monotonically with activation', () => {
      const activations = [0.2, 0.4, 0.6, 0.8, 1.0];
      const sensitivities = activations.map(activation => {
        const adj = buildConditionAdjustments(
          createConditionState({ mcas: { enabled: true, params: { activation } } })
        );
        return adj.receptorSensitivities['H1'] ?? 0;
      });

      for (let i = 1; i < sensitivities.length; i++) {
        expect(sensitivities[i]).toBeGreaterThan(sensitivities[i - 1]);
      }
    });
  });
});
