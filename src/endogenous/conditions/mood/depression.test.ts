import { describe, expect, it } from 'vitest';
import { depression } from './depression';
import { buildConditionAdjustments } from '../utils';
import { createConditionState } from '../test-utils';

describe('Depression Condition', () => {
  it('is correctly defined', () => {
    expect(depression.key).toBe('depression');
  });

  it('increases SERT activity (faster serotonin clearance)', () => {
    const state = createConditionState({
      depression: { enabled: true, params: { severity: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    expect(adjustments.transporterActivities['SERT']).toBeGreaterThan(0);
  });

  it('adjusts 5-HT1A receptor sensitivity', () => {
    const state = createConditionState({
      depression: { enabled: true, params: { severity: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    // Depression has 5HT1A sensitivity increase (autoreceptor supersensitivity)
    expect(adjustments.receptorSensitivities['5HT1A']).toBeGreaterThan(0);
  });

  describe('Monotonicity', () => {
    it('SERT activity increases monotonically with severity', () => {
      const severities = [0.2, 0.4, 0.6, 0.8, 1.0];
      const sertActivities = severities.map(severity => {
        const adj = buildConditionAdjustments(
          createConditionState({ depression: { enabled: true, params: { severity } } })
        );
        return adj.transporterActivities['SERT'] ?? 0;
      });

      for (let i = 1; i < sertActivities.length; i++) {
        expect(sertActivities[i]).toBeGreaterThan(sertActivities[i - 1]);
      }
    });

    it('5HT1A sensitivity increases monotonically with severity', () => {
      const severities = [0.2, 0.4, 0.6, 0.8, 1.0];
      const sensitivities = severities.map(severity => {
        const adj = buildConditionAdjustments(
          createConditionState({ depression: { enabled: true, params: { severity } } })
        );
        return adj.receptorSensitivities['5HT1A'] ?? 0;
      });

      for (let i = 1; i < sensitivities.length; i++) {
        expect(sensitivities[i]).toBeGreaterThan(sensitivities[i - 1]);
      }
    });
  });
});
