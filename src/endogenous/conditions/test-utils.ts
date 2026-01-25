import type { ConditionKey, ConditionStateSnapshot } from './types';

/**
 * Helper to create a complete condition state for testing, with optional overrides.
 */
export function createConditionState(
  overrides: Partial<Record<ConditionKey, { enabled: boolean; params: Record<string, number> }>> = {}
): Record<ConditionKey, ConditionStateSnapshot> {
  const baseState: Record<ConditionKey, ConditionStateSnapshot> = {
    adhd: { enabled: false, params: { severity: 0.6 } },
    autism: { enabled: false, params: { eibalance: 0.5 } },
    depression: { enabled: false, params: { severity: 0.5 } },
    anxiety: { enabled: false, params: { reactivity: 0.5 } },
    pots: { enabled: false, params: { severity: 0.5 } },
    mcas: { enabled: false, params: { activation: 0.5 } },
    insomnia: { enabled: false, params: { severity: 0.5 } },
    pcos: { enabled: false, params: { severity: 0.5 } },
    comt: { enabled: false, params: { genotype: 1.0 } },
    mthfr: { enabled: false, params: { genotype: 1.0 } },
  };

  for (const [key, value] of Object.entries(overrides)) {
    if (baseState[key as ConditionKey] && value) {
      baseState[key as ConditionKey] = {
        enabled: value.enabled ?? false,
        params: { ...baseState[key as ConditionKey].params, ...(value.params ?? {}) },
      };
    }
  }

  return baseState;
}
