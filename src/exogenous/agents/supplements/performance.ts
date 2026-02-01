import type { PharmacologyDef } from "../../../engine";

export const Creatine = (grams: number): PharmacologyDef => ({
  molecule: { name: "Creatine", molarMass: 131.13 },
  pk: {
    model: "1-compartment",
    delivery: "bolus",
    bioavailability: 0.95,
    halfLifeMin: 180,
    massMg: grams * 1000,
    timeToPeakMin: 90,
    volume: { kind: "weight", base_L_kg: 0.5 },
  },
  pd: [
    {
      target: "energy",
      mechanism: "agonist",
      intrinsicEfficacy: Math.min(10, grams * 2.0),
      unit: "%",
      tau: 60,
    },
  ],
});

/**
 * L-CARNITINE (The Fat Shuttle)
 * Transports fatty acids into mitochondria for oxidation.
 * Enhances fat burning efficiency, especially during exercise.
 */
export const LCarnitine = (mg: number): PharmacologyDef => ({
  molecule: { name: "Acetyl-L-Carnitine", molarMass: 203.24 },
  pk: {
    model: "1-compartment",
    delivery: "bolus",
    bioavailability: 0.15,
    halfLifeMin: 240,
    massMg: mg,
    timeToPeakMin: 180,
    volume: { kind: "weight", base_L_kg: 0.5 },
  },
  pd: [
    {
      target: "energy",
      mechanism: "agonist",
      intrinsicEfficacy: Math.min(15, mg * 0.01),
      unit: "%",
      tau: 120,
      description: "Improved cellular energy production.",
    },
    // NEW: Fat oxidation shuttle - helps fatty acids enter mitochondria
    {
      target: "ampk",
      mechanism: "agonist",
      intrinsicEfficacy: Math.min(0.3, mg * 0.0002),
      unit: "x",
      tau: 120,
      description: "Activates fat-burning cellular pathways.",
    },
    // NEW: Enhances mitochondrial function
    {
      target: "bdnf",
      mechanism: "agonist",
      intrinsicEfficacy: Math.min(3, mg * 0.002),
      unit: "ng/mL",
      tau: 180,
      description: "Neuroprotective effects from acetyl group.",
    },
  ],
});

export const CDPCholine = (mg: number): PharmacologyDef => ({
  molecule: { name: "Citicoline", molarMass: 488.32 },
  pk: {
    model: "1-compartment",
    delivery: "bolus",
    bioavailability: 0.9,
    halfLifeMin: 360,
    massMg: mg,
    timeToPeakMin: 60,
    volume: { kind: "tbw", fraction: 0.5 },
  },
  pd: [
    {
      target: "choline",
      mechanism: "agonist",
      intrinsicEfficacy: Math.min(8, mg * 0.02),
      unit: "µmol/L",
      tau: 60,
    },
  ],
});
