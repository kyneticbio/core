import type { SignalDefinition } from "../../../engine";

// === Scientific Constants ===
export const GLUCOSE_CONSTANTS = {
  APPEARANCE_AMPLITUDE: 2.0,
  FAST_ABSORPTION_TAU_MIN: 12,
  VD_L_KG: 0.2,
} as const;

export const glucose: SignalDefinition = {
  key: "glucose",
  label: "Glucose",
  unit: "mg/dL",
  description:
    "The primary fuel for your brain and muscles. Maintaining blood sugar in a steady range is essential for consistent energy levels, mental clarity, and long-term metabolic health.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx: any, state: any) => 90,
    tau: 35.7,
    production: [{ source: "constant", coefficient: 0.1 }],
    clearance: [
      { type: "enzyme-dependent", rate: 1.0, enzyme: "insulinAction" },
    ],
    couplings: [
      { source: "cortisol", effect: "stimulate", strength: 0.014 },
      { source: "adrenaline", effect: "stimulate", strength: 0.0014 },
    ],
  },
  initialValue: 90,
  min: 40,
  max: 400,
  display: {
    referenceRange: { min: 70, max: 140 },
  },
  monitors: [
    {
      id: "glucose_hyperglycemia",
      signal: "glucose",
      pattern: { type: "exceeds", value: 180, sustainedMins: 15 },
      outcome: "warning",
      message: "Glucose spiked above 180 mg/dL",
      description: "Blood sugar is elevated. This can happen after high-carb meals or during stress.",
    },
    {
      id: "glucose_hypoglycemia",
      signal: "glucose",
      pattern: { type: "falls_below", value: 70 },
      outcome: "warning",
      message: "Glucose dropped below 70 mg/dL",
      description: "Low blood sugar can cause shakiness, confusion, and fatigue.",
    },
    {
      id: "glucose_severe_hypoglycemia",
      signal: "glucose",
      pattern: { type: "falls_below", value: 55 },
      outcome: "critical",
      message: "Glucose critically low (< 55 mg/dL)",
      description: "Severe hypoglycemia requires immediate attention.",
    },
    {
      id: "glucose_high_variability",
      signal: "glucose",
      pattern: { type: "high_variability", windowMins: 1440, cvThreshold: 0.36 },
      outcome: "warning",
      message: "High glucose variability detected",
      description: "Large swings in blood sugar may indicate poor glycemic control.",
    },
    {
      id: "glucose_rapid_rise",
      signal: "glucose",
      pattern: { type: "increases_by", amount: 60, mode: "absolute", windowMins: 30 },
      outcome: "warning",
      message: "Rapid Glucose rise",
      description: "Blood sugar is rising very quickly, likely from high-glycemic carbohydrates.",
    },
    {
      id: "glucose_stability",
      signal: "glucose",
      pattern: { type: "low_variability", windowMins: 1440, cvThreshold: 0.1 },
      outcome: "win",
      message: "Excellent Glycemic Stability",
      description: "Your blood sugar has remained remarkably steady today. Great for energy and metabolic health.",
    },
  ],
};
