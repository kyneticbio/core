import type { PharmacologyDef } from "../../../engine";

/**
 * DIETARY FIBER
 * Gut-brain axis modulator and metabolic regulator.
 */
export const Fiber = (amountGrams: number): PharmacologyDef => {
  const glp1Effect = Math.min(5, amountGrams * 0.3);
  const scfaGabaEffect = Math.min(15, amountGrams * 0.8);
  const scfaAntiInflammatory = Math.min(0.3, amountGrams * 0.015);
  const vagalEffect = Math.min(0.3, amountGrams * 0.012);
  const gutSerotoninEffect = Math.min(5, amountGrams * 0.2);

  const kcalFromFiber = amountGrams * 2;
  const tefKcal = kcalFromFiber * 0.05;
  const thyroidEffect = Math.min(0.05, (tefKcal / 100) * 0.08);

  return {
    molecule: { name: "Dietary Fiber", molarMass: 162 },
    pk: {
      model: "1-compartment",
      delivery: "infusion",
      halfLifeMin: 240,
      timeToPeakMin: 180,
      massMg: amountGrams * 1000,
      volume: { kind: "weight", base_L_kg: 0.1 },
    },
    pd: [
      {
        target: "glp1",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 50, 
        unit: "pmol/L",
        tau: 120,
        description: "Gut bacteria trigger delayed fullness signal.",
      },
      {
        target: "ghrelin",
        mechanism: "antagonist",
        EC50: 500,
        intrinsicEfficacy: 80,
        unit: "pg/mL",
        tau: 30,
        description: "Physically fills stomach, suppressing hunger.",
      },
      {
        target: "gaba",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 30,
        unit: "nM",
        tau: 180,
        description: "Gut bacteria produce calming chemicals.",
      },
      {
        target: "vagal",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 15,
        unit: "index",
        tau: 60,
        description: "Activates gut-to-brain nerve pathway.",
      },
      {
        target: "serotonin",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 25,
        unit: "nM",
        tau: 90,
        description: "Supports gut-derived serotonin production.",
      },
      {
        target: "inflammation",
        mechanism: "antagonist",
        EC50: 500,
        intrinsicEfficacy: 8,
        unit: "index",
        tau: 240,
        description: "Reduces gut inflammation and strengthens barrier.",
      },
      {
        target: "thyroid",
        mechanism: "agonist",
        EC50: 500,
        intrinsicEfficacy: 8,
        unit: "pmol/L",
        tau: 240,
        description: "Small metabolic boost from fermentation.",
      },
    ],
  };
};
