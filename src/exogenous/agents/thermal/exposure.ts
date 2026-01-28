import type { PharmacologyDef } from "../../../engine";

export const ColdExposure = (
  tempCelsius: number,
  intensity: number = 1.0,
): PharmacologyDef => {
  const tempFactor = Math.max(0.3, (15 - tempCelsius) / 15);
  const effectiveIntensity = intensity * tempFactor;

  return {
    molecule: { name: "Cold Exposure", molarMass: 0 },
    pk: { model: "activity-dependent", delivery: "continuous", massMg: 0 },
    pd: [
      {
        target: "norepi",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(400, effectiveIntensity * 300),
        unit: "pg/mL",
        tau: 5,
        description: "Massive norepinephrine spike for focus and mood.",
      },
      {
        target: "adrenaline",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(200, effectiveIntensity * 150),
        unit: "pg/mL",
        tau: 3,
      },
      {
        target: "dopamine",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(30, effectiveIntensity * 25),
        unit: "nM",
        tau: 30,
        description: "Sustained dopamine boost for drive and mood.",
      },
      {
        target: "cortisol",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(8, effectiveIntensity * 6),
        unit: "µg/dL",
        tau: 15,
      },
      {
        target: "bdnf",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(15, effectiveIntensity * 12),
        unit: "ng/mL",
        tau: 60,
      },
      {
        target: "thyroid",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(0.2, effectiveIntensity * 0.15),
        unit: "pmol/L",
        tau: 30,
      },
      {
        target: "vagal",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(0.3, effectiveIntensity * 0.2),
        unit: "index",
        tau: 10,
      },
      {
        target: "inflammation",
        mechanism: "antagonist",
        intrinsicEfficacy: Math.min(0.3, effectiveIntensity * 0.2),
        unit: "index",
        tau: 120,
      },
      {
        target: "orexin",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(20, effectiveIntensity * 15),
        unit: "pg/mL",
        tau: 10,
      },
      // NEW: Cold-induced thermogenesis (burning fat for heat)
      {
        target: "thermogenesis",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(0.5, effectiveIntensity * 0.4),
        unit: "kcal/min",
        tau: 5,
        description: "Triggers brown fat activation for heat production.",
      },
      // NEW: Heat shock protein induction from cold stress
      {
        target: "heatShockProteins",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(2.0, effectiveIntensity * 1.5),
        unit: "fold-change",
        tau: 60,
        description: "Cellular stress response for repair and resilience.",
      },
    ],
  };
};

export const HeatExposure = (
  tempCelsius: number,
  type: "dry" | "infrared" | "steam" = "dry",
  intensity: number = 1.0,
): PharmacologyDef => {
  let tempFactor: number;
  let ghMultiplier: number;

  switch (type) {
    case "dry":
      tempFactor = Math.min(1.5, (tempCelsius - 60) / 40);
      ghMultiplier = 1.0;
      break;
    case "infrared":
      tempFactor = Math.min(1.2, (tempCelsius - 35) / 30);
      ghMultiplier = 0.7;
      break;
    case "steam":
      tempFactor = Math.min(1.3, (tempCelsius - 35) / 15);
      ghMultiplier = 0.8;
      break;
    default:
      tempFactor = 1.0;
      ghMultiplier = 1.0;
  }

  const effectiveIntensity = Math.max(0.3, intensity * tempFactor);

  return {
    molecule: { name: "Heat Exposure", molarMass: 0 },
    pk: { model: "activity-dependent", delivery: "continuous", massMg: 0 },
    pd: [
      {
        target: "growthHormone",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(25, effectiveIntensity * ghMultiplier * 20),
        unit: "ng/mL",
        tau: 20,
      },
      {
        target: "prolactin",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(15, effectiveIntensity * 10),
        unit: "ng/mL",
        tau: 30,
      },
      {
        target: "bdnf",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(12, effectiveIntensity * 10),
        unit: "ng/mL",
        tau: 45,
      },
      {
        target: "serotonin",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(8, effectiveIntensity * 6),
        unit: "nM",
        tau: 30,
      },
      {
        target: "vagal",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(0.4, effectiveIntensity * 0.3),
        unit: "index",
        tau: 20,
      },
      {
        target: "cortisol",
        mechanism: "antagonist",
        intrinsicEfficacy: Math.min(5, effectiveIntensity * 4),
        unit: "µg/dL",
        tau: 45,
      },
      {
        target: "inflammation",
        mechanism: "antagonist",
        intrinsicEfficacy: Math.min(0.25, effectiveIntensity * 0.2),
        unit: "index",
        tau: 90,
      },
      {
        target: "vasopressin",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(8, effectiveIntensity * 6),
        unit: "pg/mL",
        tau: 30,
      },
      {
        target: "orexin",
        mechanism: "antagonist",
        intrinsicEfficacy: Math.min(8, effectiveIntensity * 6),
        unit: "pg/mL",
        tau: 60,
      },
      {
        target: "endocannabinoid",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(5, effectiveIntensity * 4),
        unit: "nM",
        tau: 30,
      },
      // NEW: Heat shock protein induction (primary benefit of sauna)
      {
        target: "heatShockProteins",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(3.0, effectiveIntensity * 2.5),
        unit: "fold-change",
        tau: 30,
        description: "Cellular repair proteins triggered by heat stress.",
      },
      // NEW: Mimics cardio effect on heart rate/metabolism
      {
        target: "burnRate",
        mechanism: "agonist",
        intrinsicEfficacy: Math.min(2.0, effectiveIntensity * 1.5),
        unit: "kcal/min",
        tau: 5,
        description: "Elevated heart rate and metabolic demand.",
      },
    ],
  };
};
