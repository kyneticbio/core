import { describe, it, expect } from 'vitest';
import { INTERVENTIONS } from './index';
import { validateInterventionLibrary } from './validation';
import type { InterventionDef } from '../../types';

describe('Intervention Unit Integrity', () => {
  it('should have matching units for all pharmacological effects', () => {
    const errors = validateInterventionLibrary(INTERVENTIONS);

    if (errors.length > 0) {
      const messages = errors.map(e => `[${e.interventionKey}] ${e.message}`).join('\n');
      throw new Error(`Intervention Unit Mismatches Found:\n${messages}`);
    }
  });

  it('EC50 values must be dose-independent (fixed pharmacological constants)', () => {
    const failures: string[] = [];

    for (const def of INTERVENTIONS) {
      if (typeof def.pharmacology !== 'function') continue;

      // Find a numeric dose parameter (mg, mcg, etc.)
      const doseParam = def.params.find((p: any) =>
        ['mg', 'mcg', 'g', 'units', 'IU'].includes(p.key)
      );
      if (!doseParam) continue;

      const lowDose = doseParam.min ?? (doseParam.default ?? 1) * 0.5;
      const highDose = doseParam.max ?? (doseParam.default ?? 1) * 2;
      if (lowDose === highDose) continue;

      try {
        const lowParams = { [doseParam.key]: lowDose };
        const highParams = { [doseParam.key]: highDose };
        const lowResult = (def.pharmacology as any)(lowParams);
        const highResult = (def.pharmacology as any)(highParams);

        const lowPharms = Array.isArray(lowResult) ? lowResult : [lowResult];
        const highPharms = Array.isArray(highResult) ? highResult : [highResult];

        for (let i = 0; i < Math.min(lowPharms.length, highPharms.length); i++) {
          const lowPD = lowPharms[i].pd ?? [];
          const highPD = highPharms[i].pd ?? [];
          for (let j = 0; j < Math.min(lowPD.length, highPD.length); j++) {
            const lowEC50 = lowPD[j].EC50;
            const highEC50 = highPD[j].EC50;
            if (lowEC50 != null && highEC50 != null && lowEC50 !== highEC50) {
              failures.push(
                `[${def.key}] pd[${j}] target="${lowPD[j].target}": ` +
                `EC50 changes with dose (${lowDose}→${lowEC50.toFixed(6)}, ${highDose}→${highEC50.toFixed(6)}). ` +
                `EC50 must be a fixed constant.`
              );
            }
          }
        }
      } catch {
        // Skip interventions whose factory doesn't accept simple params
      }
    }

    if (failures.length > 0) {
      throw new Error(`Dose-dependent EC50 detected:\n${failures.join('\n')}`);
    }
  });
});
