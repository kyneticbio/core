import type { PharmacologyDef } from "../../../engine";

/**
 * AMINO ACIDS (Protein)
 * mTOR driver and modest insulinogenic.
 */
export const Protein = (
  amountGrams: number,
  context: { duration?: number } = {},
): PharmacologyDef => {
  const glp1Effect = (amountGrams / (amountGrams + 25)) * 18 * 0.4;
  const kcalFromProtein = amountGrams * 4;
  const duration = context.duration ?? 30;
  const leptinEffect = (kcalFromProtein / (kcalFromProtein + 800)) * 2.0;

  const tyrosineGrams = amountGrams * 0.05;
  const tryptophanGrams = amountGrams * 0.01;
  const dopaminePrecursorEffect = Math.min(5, tyrosineGrams * 2);
  const serotoninPrecursorEffect = Math.min(8, tryptophanGrams * 10);

  const bdnfEffect = Math.min(5, amountGrams * 0.1);
  const glutamateGrams = amountGrams * 0.1;
  const glutamateEffect = Math.min(15, glutamateGrams * 1.5);
  const histidineGrams = amountGrams * 0.02;
  const histamineEffect = Math.min(3, histidineGrams * 1.0);

  const proteinSedation = amountGrams / (amountGrams + 60);
  const tefKcal = kcalFromProtein * 0.25;
  const thyroidEffect = Math.min(0.3, (tefKcal / 100) * 0.2);
  const orexinSuppression = Math.min(5, proteinSedation * 4);

  return {
    molecule: { name: "Amino Acids", molarMass: 110 },
    pk: {
      model: "1-compartment",
      delivery: "infusion",
      halfLifeMin: 60,
      timeToPeakMin: 90,
      massMg: amountGrams * 1000,
      volume: { kind: "weight", base_L_kg: 0.5 },
    },
    pd: [
      {
        target: "mtor",
        mechanism: "linear",
        EC50: 100,
        intrinsicEfficacy: 2.0,
        unit: "mg/dL",
        tau: 90,
        description: "Protein flips the build muscle switch.",
      },
      {
        target: "insulin",
        mechanism: "linear",
        EC50: 100,
        intrinsicEfficacy: 1.0,
        unit: "mg/dL",
        tau: 45,
        description: "Protein raises insulin modestly.",
      },
      {
        target: "glucagon",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 60,
        unit: "mg/dL",
        tau: 30,
        description: "Maintains stable blood sugar.",
      },
      {
        target: "glp1",
        mechanism: "linear",
        EC50: 100,
        intrinsicEfficacy: 1.5,
        unit: "mg/dL",
        tau: 60,
        description: "Triggers gut fullness hormone.",
      },
      {
        target: "ghrelin",
        mechanism: "antagonist",
        EC50: 500,
        intrinsicEfficacy: 120,
        unit: "mg/dL",
        tau: 60,
        description: "Strongly suppresses hunger.",
      },
      {
        target: "leptin",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 25 * leptinEffect,
        unit: "mg/dL",
        tau: 150,
        description: "Signals fullness over hours.",
      },
      {
        target: "dopamine",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 15 * dopaminePrecursorEffect,
        unit: "mg/dL",
        tau: 120,
        description: "Provides tyrosine for dopamine.",
      },
      {
        target: "serotonin",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 25 * serotoninPrecursorEffect,
        unit: "mg/dL",
        tau: 150,
        description: "Provides tryptophan for serotonin.",
      },
      {
        target: "glutamate",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 30 * glutamateEffect,
        unit: "mg/dL",
        tau: 60,
        description: "Umami taste and excitatory signal.",
      },
      {
        target: "histamine",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 15 * histamineEffect,
        unit: "mg/dL",
        tau: 90,
        description: "Histidine conversion to histamine.",
      },
      {
        target: "bdnf",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 25 * bdnfEffect,
        unit: "mg/dL",
        tau: 180,
        description: "Building blocks for brain health.",
      },
      {
        target: "orexin",
        mechanism: "antagonist",
        EC50: 500,
        intrinsicEfficacy: 15 * orexinSuppression,
        unit: "mg/dL",
        tau: 90,
        description: "Mild satiety-mediated sedation.",
      },
      {
        target: "thyroid",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 30 * thyroidEffect,
        unit: "mg/dL",
        tau: 90,
        description: "Highest metabolic cost to process.",
      },
      {
        target: "caloricIntake",
        mechanism: "linear",
        unit: "mg/dL",
        EC50: 100,
        intrinsicEfficacy: 1.54,
        tau: 1,
      }
    ],
  };
};