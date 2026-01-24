import { describe, expect, it } from 'vitest';
import { adhd } from './adhd';
import { buildConditionAdjustments } from '../utils';
import { createConditionState } from '../test-utils';

describe('ADHD Condition', () => {
  it('is correctly defined', () => {
    expect(adhd.key).toBe('adhd');
    expect(adhd.transporterModifiers?.length).toBeGreaterThan(0);
  });

  it('increases DAT activity (faster dopamine clearance)', () => {
    const state = createConditionState({
      adhd: { enabled: true, params: { severity: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    expect(adjustments.transporterActivities['DAT']).toBeGreaterThan(0);
  });

  it('increases NET activity (faster norepinephrine clearance)', () => {
    const state = createConditionState({
      adhd: { enabled: true, params: { severity: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    expect(adjustments.transporterActivities['NET']).toBeGreaterThan(0);
  });

  it('reduces D2 receptor density', () => {
    const state = createConditionState({
      adhd: { enabled: true, params: { severity: 1.0 } },
    });
    const adjustments = buildConditionAdjustments(state);

    expect(adjustments.receptorDensities['D2']).toBeLessThan(0);
  });

  describe('Monotonicity', () => {
    it('DAT activity increases monotonically with severity', () => {
      const severities = [0.2, 0.4, 0.6, 0.8, 1.0];
      const datActivities = severities.map(severity => {
        const adj = buildConditionAdjustments(
          createConditionState({ adhd: { enabled: true, params: { severity } } })
        );
        return adj.transporterActivities['DAT'] ?? 0;
      });

      for (let i = 1; i < datActivities.length; i++) {
        expect(datActivities[i]).toBeGreaterThan(datActivities[i - 1]);
      }
    });

    it('NET activity increases monotonically with severity', () => {
      const severities = [0.2, 0.4, 0.6, 0.8, 1.0];
      const netActivities = severities.map(severity => {
        const adj = buildConditionAdjustments(
          createConditionState({ adhd: { enabled: true, params: { severity } } })
        );
        return adj.transporterActivities['NET'] ?? 0;
      });

      for (let i = 1; i < netActivities.length; i++) {
        expect(netActivities[i]).toBeGreaterThan(netActivities[i - 1]);
      }
    });

    it('D2 receptor density decreases monotonically with severity', () => {
      const severities = [0.2, 0.4, 0.6, 0.8, 1.0];
      const d2Densities = severities.map(severity => {
        const adj = buildConditionAdjustments(
          createConditionState({ adhd: { enabled: true, params: { severity } } })
        );
        return adj.receptorDensities['D2'] ?? 0;
      });

      for (let i = 1; i < d2Densities.length; i++) {
        expect(d2Densities[i]).toBeLessThan(d2Densities[i - 1]);
      }
    });
  });

  describe('Mechanistic Integrity', () => {
    it('does not apply legacy amplitude adjustments when mechanistic modifiers exist', () => {
      const state = createConditionState({
        adhd: { enabled: true, params: { severity: 1.0 } },
      });
      const adjustments = buildConditionAdjustments(state);

      // The dopamine amplitude adjustment should come ONLY from mechanistic modifiers
      // (receptor density effects), not from legacy signalModifiers
      const dopamineAmplitude = adjustments.baselines['dopamine']?.amplitude ?? 0;

      // D2 density -0.15 × 0.25 gainPerDensity = -0.0375
      // NOT the legacy -0.2 from signalModifiers
      expect(Math.abs(dopamineAmplitude)).toBeLessThan(0.15);
    });

    it('still applies phase shifts from legacy modifiers', () => {
      const state = createConditionState({
        adhd: { enabled: true, params: { severity: 1.0 } },
      });
      const adjustments = buildConditionAdjustments(state);

      const melatoninPhase = adjustments.baselines['melatonin']?.phaseShiftMin ?? 0;
      expect(melatoninPhase).toBeGreaterThan(0);
    });
  });
});
