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
    massMg: ml * 1000, // 1ml water approx 1g = 1000mg
    volume: { kind: "tbw", fraction: 1.0 },
  },
  pd: [
    {
      target: "hydration",
      mechanism: "agonist",
      intrinsicEfficacy: ml * 25.0, // recalibrated for % units and signal tau
      unit: "nM",
      tau: 60,
    },
    {
      target: "vagal",
      mechanism: "agonist",
      intrinsicEfficacy: 0.05 * (ml / 500),
      unit: "nM",
      tau: 30,
      description: "Cold water or stomach distension can trigger mild vagal response.",
    },
  ],
});
