import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const copper: SignalDefinition = {
  key: "copper",
  type: "nutrient",
  label: "Copper",
  unit: "µg/dL",
  isPremium: true,
  description: "Connective tissue health.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.nutritional?.copper_ug_dL;
      if (bw != null) return bw;
      const sexFactor = ctx.subject.sex === "female" ? 1.1 : 1.0;
      const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
      return 110 * sexFactor * ageFactor;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.nutritional?.copper_ug_dL;
    if (bw != null) return bw;
    const sexFactor = ctx.subject.sex === "female" ? 1.1 : 1.0;
    const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
    return 110 * sexFactor * ageFactor;
  },
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
