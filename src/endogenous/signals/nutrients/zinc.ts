import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const zinc: SignalDefinition = {
  key: "zinc",
  type: "nutrient",
  label: "Zinc",
  unit: "µg/dL",
  isPremium: true,
  description: "Essential mineral for immunity.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.nutritional?.zinc_ug_dL;
      if (bw != null) return bw;
      const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
      return 90 * ageFactor;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [{ source: "copper", effect: "inhibit", strength: 0.00003 }],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.nutritional?.zinc_ug_dL;
    if (bw != null) return bw;
    const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
    return 90 * ageFactor;
  },
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
