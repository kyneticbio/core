import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const copper: SignalDefinition = {
  key: "copper",
  label: "Copper",
  unit: "µg/dL",
  isPremium: true,
  description: "Connective tissue health.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) =>
      ctx.subject.bloodwork?.nutritional?.copper_ug_dL ?? 110,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) =>
    ctx.subject.bloodwork?.nutritional?.copper_ug_dL ?? 110,
  display: {
    referenceRange: { min: 70, max: 150 },
  },
  monitors: [
    {
      id: "low_copper",
      signal: "copper",
      pattern: { type: "falls_below", value: 70, sustainedMins: 10080 },
      outcome: "warning",
      message: "Low Copper",
      description:
        "Copper is essential for energy production and connective tissue.",
    },
  ],
};
