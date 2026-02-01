import type { PharmacologyDef } from "../../../engine";

/**
 * SILDENAFIL (Viagra)
 * PDE5 inhibitor that prevents breakdown of cGMP, prolonging
 * the vasodilatory effects of nitric oxide.
 *
 * Typical doses: 25-100mg as needed, 1 hour before activity
 */
export const Sildenafil = (mg: number = 50): PharmacologyDef => ({
  molecule: {
    name: "Sildenafil",
    molarMass: 474.58,
  },
  pk: {
    model: "1-compartment",
    bioavailability: 0.40,
    timeToPeakMin: 60,
    halfLifeMin: 240,
    delivery: "bolus",
    massMg: mg,
  },
  pd: [
    {
      target: "erectileFunction",
      mechanism: "agonist",
      EC50: 25,
      intrinsicEfficacy: Math.min(30, mg * 0.5),
      unit: "%",
      tau: 15,
    },
    {
      target: "nitricOxide",
      mechanism: "agonist",
      EC50: 30,
      intrinsicEfficacy: Math.min(20, mg * 0.3),
      unit: "nM",
      tau: 20,
    },
    {
      target: "bloodPressure",
      mechanism: "antagonist",
      EC50: 20,
      intrinsicEfficacy: Math.min(15, mg * 0.2),
      unit: "mmHg",
      tau: 30,
    },
  ],
});

/**
 * TADALAFIL (Cialis)
 * Long-acting PDE5 inhibitor. Can be used as-needed or daily.
 * Longer half-life allows for more spontaneity.
 *
 * Typical doses: 10-20mg as needed, or 2.5-5mg daily
 */
export const Tadalafil = (mg: number = 10): PharmacologyDef => ({
  molecule: {
    name: "Tadalafil",
    molarMass: 389.4,
  },
  pk: {
    model: "1-compartment",
    bioavailability: 0.36,
    timeToPeakMin: 120,
    halfLifeMin: 1020,
    delivery: "bolus",
    massMg: mg,
  },
  pd: [
    {
      target: "erectileFunction",
      mechanism: "agonist",
      EC50: 5,
      intrinsicEfficacy: Math.min(30, mg * 2.5),
      unit: "%",
      tau: 20,
    },
    {
      target: "nitricOxide",
      mechanism: "agonist",
      EC50: 8,
      intrinsicEfficacy: Math.min(20, mg * 1.5),
      unit: "nM",
      tau: 25,
    },
    {
      target: "bloodPressure",
      mechanism: "antagonist",
      EC50: 6,
      intrinsicEfficacy: Math.min(12, mg * 0.8),
      unit: "mmHg",
      tau: 45,
    },
  ],
});

/**
 * VARDENAFIL (Levitra)
 * PDE5 inhibitor with intermediate duration.
 *
 * Typical doses: 5-20mg as needed
 */
export const Vardenafil = (mg: number = 10): PharmacologyDef => ({
  molecule: {
    name: "Vardenafil",
    molarMass: 488.6,
  },
  pk: {
    model: "1-compartment",
    bioavailability: 0.15,
    timeToPeakMin: 45,
    halfLifeMin: 300,
    delivery: "bolus",
    massMg: mg,
  },
  pd: [
    {
      target: "erectileFunction",
      mechanism: "agonist",
      EC50: 15,
      intrinsicEfficacy: Math.min(30, mg * 2.0),
      unit: "%",
      tau: 15,
    },
    {
      target: "nitricOxide",
      mechanism: "agonist",
      EC50: 20,
      intrinsicEfficacy: Math.min(18, mg * 1.2),
      unit: "nM",
      tau: 20,
    },
    {
      target: "bloodPressure",
      mechanism: "antagonist",
      EC50: 18,
      intrinsicEfficacy: Math.min(12, mg * 0.8),
      unit: "mmHg",
      tau: 35,
    },
  ],
});
