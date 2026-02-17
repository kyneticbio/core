import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const zinc: SignalDefinition = {
  key: "zinc",
  label: "Zinc",
  unit: "µg/dL",
  isPremium: true,
  description: "Essential mineral for immunity.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) =>
      ctx.subject.bloodwork?.nutritional?.zinc_ug_dL ?? 90,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => ctx.subject.bloodwork?.nutritional?.zinc_ug_dL ?? 90,
  display: {
    referenceRange: { min: 70, max: 120 },
  },
  monitors: [
    {
      id: "low_zinc",
      signal: "zinc",
      pattern: { type: "falls_below", value: 70, sustainedMins: 1440 },
      outcome: "warning",
      message: "Zinc Deficiency",
      description: "Zinc is essential for immunity and hormone production.",
    },
  ],
};
