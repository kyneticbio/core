import type { PharmacologyDef } from "../../../engine";

// === Scientific Constants ===
const ETHANOL_DOSE = {
  GRAMS_PER_STANDARD_UNIT: 12,
} as const;

const ETHANOL_DISTRIBUTION = {
  WIDMARK_R_MALE: 0.68,
  WIDMARK_R_FEMALE: 0.55,
} as const;

const ETHANOL_KINETICS = {
  VMAX_DEFAULT: 0.2,
  KM_MGDL: 10,
} as const;

const ETHANOL_GABA = {
  AMPLITUDE: 25.0,
} as const;

const ETHANOL_GLUTAMATE = {
  SUPPRESSION_AMPLITUDE: 15.0,
} as const;

/**
 * ALCOHOL (Ethanol)
 * Michaelis-Menten kinetics and biphasic neuro-modulatory effects.
 */
export const Alcohol = (units: number): PharmacologyDef => {
  const grams = units * ETHANOL_DOSE.GRAMS_PER_STANDARD_UNIT;
  const mg = grams * 1000;
  
  return {
    molecule: { name: "Ethanol", molarMass: 46.07 },
    pk: {
      model: "michaelis-menten",
      delivery: "infusion",
      bioavailability: 1.0,
      Vmax: ETHANOL_KINETICS.VMAX_DEFAULT,
      Km: ETHANOL_KINETICS.KM_MGDL * 10, // Convert mg/dL to mg/L
      massMg: mg,
      volume: { 
        kind: "sex-adjusted", 
        male_L_kg: ETHANOL_DISTRIBUTION.WIDMARK_R_MALE, 
        female_L_kg: ETHANOL_DISTRIBUTION.WIDMARK_R_FEMALE 
      },
    },
    pd: [
      {
        target: "GABA_A",
        mechanism: "PAM",
        EC50: 500,
        intrinsicEfficacy: 100 * units,
        unit: "fold-change",
      },
      {
        target: "ethanol",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 100, 
        unit: "mg/dL",
      },
      {
        target: "dopamine",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 60 * units,
        unit: "nM",
        tau: 10,
      },
      {
        target: "NMDA",
        mechanism: "NAM",
        EC50: 500,
        intrinsicEfficacy: 40 * units,
        unit: "fold-change",
      },
      {
        target: "vasopressin",
        mechanism: "antagonist",
        EC50: 500,
        intrinsicEfficacy: 80 * units,
        unit: "pg/mL",
      },
      {
        target: "cortisol",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 60 * units,
        unit: "µg/dL",
      },
      {
        target: "inflammation",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 10 * units,
        unit: "index",
      },
    ],
  };
};