import type { PharmacologyDef } from "../../../engine";

// === Semaglutide (Ozempic / Wegovy) ===
// Selective GLP-1 receptor agonist. Weekly subcutaneous injection.
// 94% sequence homology with native GLP-1, albumin-binding fatty acid chain
// extends half-life to ~7 days.
// Peak plasma at 0.5mg: ~0.053 mg/L (Vd ~8.4L)
// Dose range: 0.25–2.4 mg/wk

const SEMAGLUTIDE_MOLAR_MASS = 4113.58;
const SEMAGLUTIDE_HALFLIFE_MIN = 10080; // ~7 days

// Fixed EC50 values - calibrated to mid-range dose (1.0 mg).
// EC50 should be high enough that low doses produce partial occupancy
// and high doses approach saturation, giving a clear dose-response curve.
// midPeak = (1.0 * 0.89) / 8.4 ≈ 0.106 mg/L
// EC50 ≈ midPeak * 1.5 so that low doses get ~25% occupancy, high doses ~75%
const SEMAGLUTIDE_MID_PEAK = (1.0 * 0.89) / 8.4;
const SEMAGLUTIDE_EC50 = SEMAGLUTIDE_MID_PEAK * 1.5; // ~0.159

export const Semaglutide = (mg: number): PharmacologyDef => {
  return {
    molecule: {
      name: "Semaglutide",
      molarMass: SEMAGLUTIDE_MOLAR_MASS,
    },
    pk: {
      model: "1-compartment",
      delivery: "bolus",
      bioavailability: 0.89,
      halfLifeMin: SEMAGLUTIDE_HALFLIFE_MIN,
      massMg: mg,
      timeToPeakMin: 2160, // ~1.5 days
      volume: { kind: "weight", base_L_kg: 0.12 },
    },
    pd: [
      {
        target: "glp1",
        mechanism: "agonist",
        EC50: SEMAGLUTIDE_EC50,
        intrinsicEfficacy: Math.min(40, mg * 20),
        unit: "pmol/L",
        tau: 3,
        description: "GLP-1 receptor activation - primary mechanism",
      },
      {
        target: "gastricEmptying",
        mechanism: "agonist",
        EC50: SEMAGLUTIDE_EC50,
        intrinsicEfficacy: -Math.min(30, mg * 15),
        unit: "nM",
        tau: 3,
        description: "Slows gastric emptying - appetite and GI effects",
      },
      {
        target: "appetite",
        mechanism: "agonist",
        EC50: SEMAGLUTIDE_EC50,
        intrinsicEfficacy: -Math.min(35, mg * 18),
        unit: "nM",
        tau: 3,
        description: "Central appetite suppression via hypothalamic GLP-1R",
      },
      {
        target: "insulin",
        mechanism: "agonist",
        EC50: SEMAGLUTIDE_EC50 * 1.5,
        intrinsicEfficacy: Math.min(6, mg * 3),
        unit: "nM",
        tau: 3,
        description: "Glucose-dependent insulin secretion",
      },
      {
        target: "glucagon",
        mechanism: "antagonist",
        EC50: SEMAGLUTIDE_EC50 * 1.5,
        intrinsicEfficacy: Math.min(15, mg * 8),
        unit: "pg/mL",
        tau: 3,
        description: "Suppresses inappropriate glucagon release",
      },
      {
        target: "inflammation",
        mechanism: "antagonist",
        EC50: SEMAGLUTIDE_EC50 * 2,
        intrinsicEfficacy: Math.min(0.4, mg * 0.2),
        unit: "nM",
        tau: 3,
        description: "Anti-inflammatory effects via reduced visceral adiposity",
      },
    ],
  };
};

// === Tirzepatide (Mounjaro / Zepbound) ===
// Dual GLP-1/GIP receptor agonist. Weekly subcutaneous injection.
// Greater weight loss efficacy than semaglutide due to dual incretin action.
// Peak plasma at 5mg: ~0.41 mg/L (Vd ~9.8L)
// Dose range: 2.5–15 mg/wk

const TIRZEPATIDE_MOLAR_MASS = 4813.45;
const TIRZEPATIDE_HALFLIFE_MIN = 7200; // ~5 days

// Fixed EC50 - calibrated to mid-range dose (7.5 mg).
// midPeak = (7.5 * 0.8) / 9.8 ≈ 0.612 mg/L
const TIRZEPATIDE_MID_PEAK = (7.5 * 0.8) / 9.8;
const TIRZEPATIDE_EC50 = TIRZEPATIDE_MID_PEAK * 1.5; // ~0.918

export const Tirzepatide = (mg: number): PharmacologyDef => {
  return {
    molecule: {
      name: "Tirzepatide",
      molarMass: TIRZEPATIDE_MOLAR_MASS,
    },
    pk: {
      model: "1-compartment",
      delivery: "bolus",
      bioavailability: 0.8,
      halfLifeMin: TIRZEPATIDE_HALFLIFE_MIN,
      massMg: mg,
      timeToPeakMin: 1440,
      volume: { kind: "weight", base_L_kg: 0.14 },
    },
    pd: [
      {
        target: "glp1",
        mechanism: "agonist",
        EC50: TIRZEPATIDE_EC50,
        intrinsicEfficacy: Math.min(30, mg * 3),
        unit: "pmol/L",
        tau: 3,
        description: "GLP-1 receptor activation",
      },
      {
        target: "gip",
        mechanism: "agonist",
        EC50: TIRZEPATIDE_EC50 * 0.8, // more potent at GIP
        intrinsicEfficacy: Math.min(35, mg * 3.5),
        unit: "pmol/L",
        tau: 3,
        description: "GIP receptor activation - dual incretin action",
      },
      {
        target: "gastricEmptying",
        mechanism: "agonist",
        EC50: TIRZEPATIDE_EC50,
        intrinsicEfficacy: -Math.min(25, mg * 2.5),
        unit: "nM",
        tau: 3,
        description: "Slows gastric emptying",
      },
      {
        target: "appetite",
        mechanism: "agonist",
        EC50: TIRZEPATIDE_EC50,
        intrinsicEfficacy: -Math.min(40, mg * 4),
        unit: "nM",
        tau: 3,
        description: "Appetite suppression - stronger than mono-GLP-1 agonists",
      },
      {
        target: "insulin",
        mechanism: "agonist",
        EC50: TIRZEPATIDE_EC50 * 1.5,
        intrinsicEfficacy: Math.min(8, mg * 0.8),
        unit: "nM",
        tau: 3,
        description:
          "Enhanced glucose-dependent insulin secretion (dual incretin)",
      },
      {
        target: "glucagon",
        mechanism: "antagonist",
        EC50: TIRZEPATIDE_EC50 * 1.5,
        intrinsicEfficacy: Math.min(12, mg * 1.2),
        unit: "pg/mL",
        tau: 3,
        description: "Suppresses glucagon release",
      },
      {
        target: "inflammation",
        mechanism: "antagonist",
        EC50: TIRZEPATIDE_EC50 * 2,
        intrinsicEfficacy: Math.min(0.5, mg * 0.05),
        unit: "nM",
        tau: 3,
        description: "Anti-inflammatory effects",
      },
    ],
  };
};

// === Retatrutide ===
// Triple GLP-1/GIP/glucagon receptor agonist. Weekly subcutaneous injection.
// The glucagon receptor agonism increases energy expenditure and thermogenesis.
// Peak plasma at 4mg: ~0.33 mg/L (Vd ~9.1L)
// Dose range: 1–12 mg/wk

const RETATRUTIDE_MOLAR_MASS = 4605.2;
const RETATRUTIDE_HALFLIFE_MIN = 10080; // ~7 days

// Fixed EC50 - calibrated to mid-range dose (6 mg).
// midPeak = (6 * 0.75) / 9.1 ≈ 0.495 mg/L
const RETATRUTIDE_MID_PEAK = (6 * 0.75) / 9.1;
const RETATRUTIDE_EC50 = RETATRUTIDE_MID_PEAK * 1.5; // ~0.742

export const Retatrutide = (mg: number): PharmacologyDef => {
  return {
    molecule: {
      name: "Retatrutide",
      molarMass: RETATRUTIDE_MOLAR_MASS,
    },
    pk: {
      model: "1-compartment",
      delivery: "bolus",
      bioavailability: 0.75,
      halfLifeMin: RETATRUTIDE_HALFLIFE_MIN,
      massMg: mg,
      timeToPeakMin: 2160,
      volume: { kind: "weight", base_L_kg: 0.13 },
    },
    pd: [
      {
        target: "glp1",
        mechanism: "agonist",
        EC50: RETATRUTIDE_EC50,
        intrinsicEfficacy: Math.min(25, mg * 2.5),
        unit: "pmol/L",
        tau: 3,
        description: "GLP-1 receptor activation",
      },
      {
        target: "gip",
        mechanism: "agonist",
        EC50: RETATRUTIDE_EC50,
        intrinsicEfficacy: Math.min(25, mg * 2.5),
        unit: "pmol/L",
        tau: 3,
        description: "GIP receptor activation",
      },
      {
        target: "glucagon",
        mechanism: "agonist",
        EC50: RETATRUTIDE_EC50 * 1.2,
        intrinsicEfficacy: Math.min(20, mg * 2),
        unit: "pg/mL",
        tau: 3,
        description: "Glucagon receptor agonism - increases energy expenditure",
      },
      {
        target: "gastricEmptying",
        mechanism: "agonist",
        EC50: RETATRUTIDE_EC50,
        intrinsicEfficacy: -Math.min(25, mg * 2.5),
        unit: "nM",
        tau: 3,
        description: "Slows gastric emptying",
      },
      {
        target: "appetite",
        mechanism: "agonist",
        EC50: RETATRUTIDE_EC50 * 0.8,
        intrinsicEfficacy: -Math.min(45, mg * 4.5),
        unit: "nM",
        tau: 3,
        description: "Potent appetite suppression via triple agonism",
      },
      {
        target: "insulin",
        mechanism: "agonist",
        EC50: RETATRUTIDE_EC50 * 1.5,
        intrinsicEfficacy: Math.min(7, mg * 0.7),
        unit: "nM",
        tau: 3,
        description: "Glucose-dependent insulin secretion",
      },
      {
        target: "burnRate",
        mechanism: "agonist",
        EC50: RETATRUTIDE_EC50 * 1.2,
        intrinsicEfficacy: Math.min(0.3, mg * 0.03),
        unit: "nM",
        tau: 3,
        description:
          "Increased energy expenditure via glucagon-mediated thermogenesis",
      },
      {
        target: "inflammation",
        mechanism: "antagonist",
        EC50: RETATRUTIDE_EC50 * 2,
        intrinsicEfficacy: Math.min(0.5, mg * 0.05),
        unit: "nM",
        tau: 3,
        description: "Anti-inflammatory effects",
      },
    ],
  };
};
