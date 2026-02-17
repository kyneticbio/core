import {
  type Signal,
  SIGNALS_ALL,
  SIGNAL_UNITS,
  getReceptorSignals,
  isKnownTarget,
  isReceptor,
} from "../../endogenous";
import type { PharmacologyDef } from "../../engine";
import type { InterventionDef } from "../../types";

export interface InterventionValidationError {
  interventionKey: string;
  targetIndex: number;
  target: string;
  message: string;
}

/**
 * Check if a target string is valid (mechanism, signal, or auxiliary pool).
 */
export function isValidTarget(target: string): boolean {
  return (
    isKnownTarget(target) || (SIGNALS_ALL as readonly string[]).includes(target)
  );
}

/**
 * Validates a single Pharmacology definition.
 */
export function validateInterventionPharmacology(
  key: string,
  pharmacology: PharmacologyDef,
): InterventionValidationError[] {
  const errors: InterventionValidationError[] = [];
  if (!pharmacology.pd) return errors;

  pharmacology.pd.forEach((pd: any, index: number) => {
    // 1. Validate Target Existence
    if (!isValidTarget(pd.target)) {
      errors.push({
        interventionKey: key,
        targetIndex: index,
        target: pd.target,
        message: `Unknown pharmacological target "${pd.target}"`,
      });
      return;
    }

    // 2. Validate Units
    const target = pd.target;
    const effectUnit = pd.unit;

    // Allowed concentration units (must match PDUnit type and engine conversions)
    const VALID_CONCENTRATION_UNITS = new Set([
      "mg/L", "mg/dL", "µg/dL", "ng/mL", "pg/mL", "ng/dL",
      "nM", "uM", "µM", "pmol/L", "µmol/L"
    ]);

    if (effectUnit) {
      if (!VALID_CONCENTRATION_UNITS.has(effectUnit)) {
         errors.push({
          interventionKey: key,
          targetIndex: index,
          target: target,
          message: `Invalid PD unit '${effectUnit}'. Must be a supported concentration unit (e.g. 'nM', 'mg/L').`,
        });
      }
    }
    // We no longer check if pd.unit matches the target signal's unit,
    // because pd.unit is now the INPUT concentration unit (for EC50),
    // whereas the target signal's unit is the OUTPUT effect unit (implicit in efficacy).
  });

  return errors;
}

/**
 * Validates all interventions in a library.
 */
export function validateInterventionLibrary(
  defs: InterventionDef[],
): InterventionValidationError[] {
  const allErrors: InterventionValidationError[] = [];

  for (const def of defs) {
    let pharms: PharmacologyDef[] = [];

    if (typeof def.pharmacology === "function") {
      try {
        // Instantiate with dummy params for validation
        const defaultParams = Object.fromEntries(
          def.params.map((p: any) => [p.key, p.default ?? 0]),
        );
        const result = (def.pharmacology as any)(defaultParams);
        pharms = Array.isArray(result) ? result : [result];
      } catch (e) {
        allErrors.push({
          interventionKey: def.key,
          targetIndex: -1,
          target: "factory",
          message: `Failed to instantiate dynamic pharmacology: ${e}`,
        });
        continue;
      }
    } else if (def.pharmacology) {
      pharms = [def.pharmacology];
    }

    for (const pharm of pharms) {
      const errors = validateInterventionPharmacology(def.key, pharm);
      allErrors.push(...errors);
    }
  }

  return allErrors;
}
