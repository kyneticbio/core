import type { PharmacologyDef } from "../../../engine";

/**
 * L-CITRULLINE
 * Amino acid that converts to L-arginine in the kidneys, then to nitric oxide.
 * More bioavailable than direct L-arginine supplementation due to bypassing
 * first-pass metabolism in the liver.
 *
 * Typical doses: 3-6g for general health, 6-8g for exercise/erectile function
 */
export const LCitrulline = (mg: number = 3000): PharmacologyDef => ({
  molecule: {
    name: "L-Citrulline",
    molarMass: 175.19,
  },
  pk: {
    model: "1-compartment",
    bioavailability: 0.80,
    timeToPeakMin: 60,
    halfLifeMin: 60,
    delivery: "bolus",
    massMg: mg,
  },
  pd: [
    {
      target: "nitricOxide",
      mechanism: "agonist",
      EC50: 15000,
      intrinsicEfficacy: Math.min(25, mg * 0.005),
      unit: "nM",
      tau: 30,
    },
    {
      target: "erectileFunction",
      mechanism: "agonist",
      EC50: 20000,
      intrinsicEfficacy: Math.min(15, mg * 0.003),
      unit: "nM",
      tau: 45,
    },
    {
      target: "bloodPressure",
      mechanism: "antagonist",
      EC50: 20000,
      intrinsicEfficacy: Math.min(8, mg * 0.002),
      unit: "nM",
      tau: 60,
    },
  ],
});

/**
 * L-ARGININE
 * Direct precursor to nitric oxide via nitric oxide synthase (NOS).
 * Less effective than citrulline due to first-pass metabolism,
 * but still commonly used.
 *
 * Typical doses: 3-6g for general health, 6-10g for exercise/erectile function
 */
export const LArginine = (mg: number = 3000): PharmacologyDef => ({
  molecule: {
    name: "L-Arginine",
    molarMass: 174.2,
  },
  pk: {
    model: "1-compartment",
    bioavailability: 0.20,
    timeToPeakMin: 45,
    halfLifeMin: 90,
    delivery: "bolus",
    massMg: mg,
  },
  pd: [
    {
      target: "nitricOxide",
      mechanism: "agonist",
      EC50: 25000,
      intrinsicEfficacy: Math.min(15, mg * 0.003),
      unit: "nM",
      tau: 30,
    },
    {
      target: "erectileFunction",
      mechanism: "agonist",
      EC50: 30000,
      intrinsicEfficacy: Math.min(10, mg * 0.002),
      unit: "nM",
      tau: 45,
    },
    {
      target: "bloodPressure",
      mechanism: "antagonist",
      EC50: 25000,
      intrinsicEfficacy: Math.min(5, mg * 0.001),
      unit: "nM",
      tau: 60,
    },
  ],
});

/**
 * CITRULLINE MALATE
 * L-Citrulline bound to malic acid for better absorption.
 * Common in pre-workout supplements.
 * Note: 2:1 ratio means 2g citrulline malate = ~1.3g pure citrulline
 *
 * Typical doses: 6-8g (providing ~4-5g citrulline)
 */
export const CitrullineMalate = (mg: number = 6000): PharmacologyDef => {
  const citrullineContent = mg * 0.66;
  return {
    molecule: {
      name: "Citrulline Malate",
      molarMass: 309.27,
    },
    pk: {
      model: "1-compartment",
      bioavailability: 0.85,
      timeToPeakMin: 50,
      halfLifeMin: 60,
      delivery: "bolus",
      massMg: mg,
    },
    pd: [
      {
        target: "nitricOxide",
        mechanism: "agonist",
        EC50: 12000,
        intrinsicEfficacy: Math.min(25, citrullineContent * 0.005),
        unit: "nM",
        tau: 30,
      },
      {
        target: "erectileFunction",
        mechanism: "agonist",
        EC50: 18000,
        intrinsicEfficacy: Math.min(15, citrullineContent * 0.003),
        unit: "nM",
        tau: 45,
      },
      {
        target: "bloodPressure",
        mechanism: "antagonist",
        EC50: 18000,
        intrinsicEfficacy: Math.min(8, citrullineContent * 0.002),
        unit: "nM",
        tau: 60,
      },
      {
        target: "energy",
        mechanism: "agonist",
        EC50: 20000,
        intrinsicEfficacy: Math.min(5, mg * 0.001),
        unit: "nM",
        tau: 30,
      },
    ],
  };
};
