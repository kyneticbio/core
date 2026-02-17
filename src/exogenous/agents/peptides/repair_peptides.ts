import type { PharmacologyDef } from "../../../engine";

// === BPC-157 (Body Protection Compound-157) ===
// Pentadecapeptide derived from human gastric juice.
// Primary mechanism: VEGF upregulation → angiogenesis → tissue repair.
// Also modulates NO, dopamine, and growth factor pathways.
// Peak plasma at 250mcg: ~0.010 mg/L (Vd ~16.8L)
// Dose range: 100–1000 mcg

const BPC157_MOLAR_MASS = 1419.53;
const BPC157_HALFLIFE_MIN = 240; // ~4 hours (estimated, limited human PK data)

// Fixed EC50 — calibrated to mid-range dose (500 mcg = 0.5 mg).
// midPeak = (0.5 * 0.7) / 16.8 ≈ 0.0208 mg/L
const BPC157_MID_PEAK = (0.5 * 0.7) / 16.8;
const BPC157_EC50 = BPC157_MID_PEAK * 1.5; // ~0.031

export const BPC157 = (mcg: number): PharmacologyDef => {
  const mg = mcg / 1000;

  return {
    molecule: {
      name: "BPC-157",
      molarMass: BPC157_MOLAR_MASS,
    },
    pk: {
      model: "1-compartment",
      delivery: "bolus",
      bioavailability: 0.7,
      halfLifeMin: BPC157_HALFLIFE_MIN,
      massMg: mg,
      timeToPeakMin: 60,
      volume: { kind: "tbw", fraction: 0.4 },
    },
    pd: [
      {
        target: "vegf",
        mechanism: "agonist",
        EC50: BPC157_EC50,
        intrinsicEfficacy: Math.min(30, mcg * 0.06),
        unit: "pg/mL",
        tau: 3,
        description: "VEGF upregulation — primary tissue repair mechanism",
      },
      {
        target: "igf1",
        mechanism: "agonist",
        EC50: BPC157_EC50 * 1.3,
        intrinsicEfficacy: Math.min(10, mcg * 0.02),
        unit: "ng/mL",
        tau: 3,
        description: "Growth factor pathway activation",
      },
      {
        target: "nitricOxide",
        mechanism: "agonist",
        EC50: BPC157_EC50,
        intrinsicEfficacy: Math.min(8, mcg * 0.016),
        unit: "nM",
        tau: 3,
        description: "NO pathway activation — vasodilation and blood flow",
      },
      {
        target: "inflammation",
        mechanism: "antagonist",
        EC50: BPC157_EC50 * 1.3,
        intrinsicEfficacy: Math.min(0.5, mcg * 0.001),
        unit: "nM",
        tau: 3,
        description: "Anti-inflammatory effects via multiple cytokine pathways",
      },
      {
        target: "growthHormone",
        mechanism: "agonist",
        EC50: BPC157_EC50 * 1.5,
        intrinsicEfficacy: Math.min(1.0, mcg * 0.002),
        unit: "ng/mL",
        tau: 3,
        description: "Mild GH secretagogue effect",
      },
      {
        target: "dopamine",
        mechanism: "agonist",
        EC50: BPC157_EC50,
        intrinsicEfficacy: Math.min(5, mcg * 0.01),
        unit: "nM",
        tau: 3,
        description: "Dopaminergic system modulation — neuroprotective effects",
      },
    ],
  };
};

// === TB-500 (Thymosin Beta-4 fragment) ===
// 43-amino-acid peptide, the active fragment of Thymosin Beta-4.
// Primary mechanism: Direct stimulation of cell migration and angiogenesis
// via actin polymerization (G-actin sequestering), NOT purely VEGF-mediated.
// Peak plasma at 2.5mg: ~0.089 mg/L (Vd ~21L)
// Dose range: 1–10 mg

const TB500_MOLAR_MASS = 4963.5;
const TB500_HALFLIFE_MIN = 360; // ~6 hours

// Fixed EC50 — calibrated to mid-range dose (5 mg).
// midPeak = (5 * 0.75) / 21 ≈ 0.179 mg/L
const TB500_MID_PEAK = (5 * 0.75) / 21;
const TB500_EC50 = TB500_MID_PEAK * 1.5; // ~0.268

export const TB500 = (mg: number): PharmacologyDef => {
  return {
    molecule: {
      name: "TB-500",
      molarMass: TB500_MOLAR_MASS,
    },
    pk: {
      model: "1-compartment",
      delivery: "bolus",
      bioavailability: 0.75,
      halfLifeMin: TB500_HALFLIFE_MIN,
      massMg: mg,
      timeToPeakMin: 120,
      volume: { kind: "tbw", fraction: 0.5 },
    },
    pd: [
      {
        target: "angiogenesis",
        mechanism: "agonist",
        EC50: TB500_EC50,
        intrinsicEfficacy: Math.min(0.5, mg * 0.1),
        unit: "nM",
        tau: 3,
        description: "Direct angiogenesis via actin regulation and cell migration",
      },
      {
        target: "vegf",
        mechanism: "agonist",
        EC50: TB500_EC50,
        intrinsicEfficacy: Math.min(20, mg * 4),
        unit: "pg/mL",
        tau: 3,
        description: "Secondary VEGF upregulation",
      },
      {
        target: "inflammation",
        mechanism: "antagonist",
        EC50: TB500_EC50,
        intrinsicEfficacy: Math.min(0.5, mg * 0.1),
        unit: "nM",
        tau: 3,
        description: "Anti-inflammatory via IL-6 and TNF-alpha suppression",
      },
      {
        target: "igf1",
        mechanism: "agonist",
        EC50: TB500_EC50 * 1.3,
        intrinsicEfficacy: Math.min(8, mg * 1.6),
        unit: "ng/mL",
        tau: 3,
        description: "Growth signaling enhancement",
      },
    ],
  };
};
