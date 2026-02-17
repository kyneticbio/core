import type { SignalDefinition, DynamicsContext } from "../../../engine";

// === Scientific Constants ===
const INSULIN_CONSTANTS = {
  FAST_PHASE_ONSET_MIN: 5,
  FAST_PHASE_CLEARANCE_MIN: 35,
  SLOW_PHASE_ONSET_MIN: 18,
  SLOW_PHASE_CLEARANCE_MIN: 160,
  FAST_PHASE_WEIGHT: 0.6,
  SLOW_PHASE_WEIGHT: 0.4,
} as const;

export const insulin: SignalDefinition = {
  key: "insulin",
  label: "Insulin",
  isPremium: true,
  unit: "µIU/mL",
  description:
    "The 'storage' hormone. Produced by the pancreas, insulin moves sugar from the blood into your cells to be used for immediate energy or saved for later. It's the master regulator of nutrient storage.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) =>
      ctx.subject.bloodwork?.metabolic?.fasting_insulin_uIU_mL ?? 8.0,
    tau: 10,
    production: [
      {
        source: "glucose",
        coefficient: 0.1,
        transform: (G: any) => Math.max(0, G - 90), // Responds when glucose > 90
      },
    ],
    clearance: [{ type: "linear", rate: 0.05 }],
    couplings: [{ source: "glucagon", effect: "inhibit", strength: 0.01 }],
  },
  initialValue: (ctx) =>
    ctx.subject.bloodwork?.metabolic?.fasting_insulin_uIU_mL ?? 8,
  min: 0,
  max: 200,
  display: {
    referenceRange: { min: 2, max: 25 },
  },
  monitors: [
    {
      id: "hyperinsulinemia",
      signal: "insulin",
      pattern: { type: "exceeds", value: 60, sustainedMins: 60 },
      outcome: "warning",
      message: "Hyperinsulinemia detected",
      description:
        "Significantly high insulin levels. May indicate insulin resistance or a very high glycemic load.",
    },
    {
      id: "fasting_hyperinsulinemia",
      signal: "insulin",
      pattern: { type: "exceeds", value: 15, sustainedMins: 480 }, // 8 hours (sleep)
      outcome: "warning",
      message: "Elevated Fasting Insulin",
      description:
        "Insulin remains high even while fasting. A strong marker for insulin resistance.",
    },
  ],
};
