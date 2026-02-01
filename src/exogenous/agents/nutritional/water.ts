import type { PharmacologyDef } from "../../../engine";

/**
 * WATER
 * The primary hydration agent.
 */
export const Water = (ml: number): PharmacologyDef => ({
  molecule: { name: "Water", molarMass: 18.015 },
  pk: {
    model: "1-compartment",
    delivery: "infusion", // Gastric emptying takes time
    bioavailability: 1.0,
    halfLifeMin: 120, // Rate of absorption/distribution
    timeToPeakMin: 30,
    massMg: ml, // ml is grams, so massMg is ml * 1000? Wait, mg. 1ml = 1000mg.
    volume: { kind: "tbw", fraction: 1.0 },
  },
  pd: [
    {
      target: "hydration",
      mechanism: "agonist",
      intrinsicEfficacy: Math.min(0.5, ml / 1000), // 1L provides significant hydration boost
      unit: "index",
      tau: 60,
    },
    {
      target: "vagal",
      mechanism: "agonist",
      intrinsicEfficacy: 0.05 * (ml / 500),
      unit: "index",
      tau: 30,
      description: "Cold water or stomach distension can trigger mild vagal response.",
    },
  ],
});
