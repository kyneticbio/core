import { describe, expect, it } from 'vitest';
import { pots } from './pots';
import { buildConditionAdjustments } from '../utils';
import { createConditionState } from '../test-utils';

describe('POTS Condition', () => {
  it('is correctly defined', () => {
    expect(pots.key).toBe('pots');
  });

  it('reduces NET activity (NE accumulation)', () => {
    const state = createConditionState({
      pots: { enabled: true, params: { severity: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    // POTS has NET dysfunction leading to NE accumulation
    expect(adjustments.transporterActivities['NET']).toBeLessThan(0);
  });

  it('increases Alpha1 receptor sensitivity', () => {
    const state = createConditionState({
      pots: { enabled: true, params: { severity: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    expect(adjustments.receptorSensitivities['Alpha1']).toBeGreaterThan(0);
  });

  describe('Monotonicity', () => {
    it('NET activity decreases (more negative) monotonically with severity', () => {
      const severities = [0.2, 0.4, 0.6, 0.8, 1.0];
      const netActivities = severities.map(severity => {
        const adj = buildConditionAdjustments(
          createConditionState({ pots: { enabled: true, params: { severity } } })
        );
        return adj.transporterActivities['NET'] ?? 0;
      });

      // NET should become more negative with severity
      for (let i = 1; i < netActivities.length; i++) {
        expect(netActivities[i]).toBeLessThan(netActivities[i - 1]);
      }
    });

    it('Alpha1 sensitivity increases monotonically with severity', () => {
      const severities = [0.2, 0.4, 0.6, 0.8, 1.0];
      const sensitivities = severities.map(severity => {
        const adj = buildConditionAdjustments(
          createConditionState({ pots: { enabled: true, params: { severity } } })
        );
        return adj.receptorSensitivities['Alpha1'] ?? 0;
      });

      for (let i = 1; i < sensitivities.length; i++) {
        expect(sensitivities[i]).toBeGreaterThan(sensitivities[i - 1]);
      }
    });
  });
});
