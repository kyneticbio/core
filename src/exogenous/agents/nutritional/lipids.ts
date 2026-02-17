import type { PharmacologyDef } from "../../../engine";

/**
 * LIPIDS (Fat)
 * Satiety signal and caloric density.
 */
export const Lipids = (
  amountGrams: number,
  context: { duration?: number } = {},
): PharmacologyDef => {
  const kcalFromFat = amountGrams * 9;
  const duration = context.duration ?? 30;
  const leptinEffect = (kcalFromFat / (kcalFromFat + 400)) * 4.0;
  const vagalEffect = Math.min(0.5, amountGrams * 0.015);
  const achEffect = Math.min(15, amountGrams * 0.4);
  const endocannabinoidEffect = Math.min(8, amountGrams * 0.25);

  const fatSedation = amountGrams / (amountGrams + 40);
  const orexinSuppression = Math.min(10, fatSedation * 8);
  const norepinephrineSuppression = Math.min(80, fatSedation * 60);
  const cortisolSuppression = Math.min(4, fatSedation * 3);

  const tefKcal = kcalFromFat * 0.03;
  const thyroidEffect = Math.min(0.08, (tefKcal / 100) * 0.05);

  return {
    molecule: { name: "Lipids", molarMass: 282 },
    pk: {
      model: "1-compartment",
      delivery: "infusion",
      halfLifeMin: 120,
      timeToPeakMin: 180,
      massMg: amountGrams * 1000,
      volume: { kind: "weight", base_L_kg: 0.3 },
    },
    pd: [
      {
        target: "ghrelin",
        mechanism: "antagonist",
        EC50: 500,
        intrinsicEfficacy: 150, 
        unit: "mg/dL",
        tau: 60,
        description: "Fat powerfully suppresses the hunger hormone.",
      },
      {
        target: "leptin",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 40 * leptinEffect,
        unit: "mg/dL",
        tau: 120,
        description: "Fat triggers strong fullness signaling.",
      },
      {
        target: "glp1",
        mechanism: "linear",
        EC50: 100,
        intrinsicEfficacy: 1.5,
        unit: "mg/dL",
        tau: 90,
        description: "Fat stimulates gut fullness hormones.",
      },
      {
        target: "vagal",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 0.5 * vagalEffect,
        unit: "mg/dL",
        tau: 45,
        description: "Activates the rest-and-digest nerve.",
      },
      {
        target: "acetylcholine",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 30 * achEffect,
        unit: "mg/dL",
        tau: 30,
        description: "Parasympathetic signal for digestion.",
      },
      {
        target: "dopamine",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 25,
        unit: "mg/dL",
        tau: 25,
        description: "Rich foods light up reward circuits.",
      },
      {
        target: "oxytocin",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 15,
        unit: "mg/dL",
        tau: 60,
        description: "Comfort foods trigger bonding hormones.",
      },
      {
        target: "endocannabinoid",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 30 * endocannabinoidEffect,
        unit: "mg/dL",
        tau: 90,
        description: "Triggers body's natural bliss molecules.",
      },
      {
        target: "orexin",
        mechanism: "antagonist",
        EC50: 500,
        intrinsicEfficacy: 15 * orexinSuppression,
        unit: "mg/dL",
        tau: 90,
        description: "Heavy meals suppress wakefulness signals.",
      },
      {
        target: "norepi",
        mechanism: "antagonist",
        EC50: 500,
        intrinsicEfficacy: 80 * norepinephrineSuppression / 80,
        unit: "mg/dL",
        tau: 60,
        description: "Alertness chemicals drop during digestion.",
      },
      {
        target: "cortisol",
        mechanism: "antagonist",
        EC50: 500,
        intrinsicEfficacy: 15 * cortisolSuppression / 4,
        unit: "mg/dL",
        tau: 90,
        description: "Comfort eating reduces cortisol.",
      },
      {
        target: "inflammation",
        mechanism: "linear",
        EC50: 100,
        intrinsicEfficacy: 0.2,
        unit: "mg/dL",
        tau: 120,
        description: "Temporary post-prandial inflammation.",
      },
      {
        target: "thyroid",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 8,
        unit: "mg/dL",
        tau: 120,
        description: "Low metabolic cost to process fat.",
      },
      {
        target: "caloricIntake",
        mechanism: "linear",
        unit: "mg/dL",
        EC50: 100,
        intrinsicEfficacy: 1.08,
        tau: 1,
      }
    ],
  };
};