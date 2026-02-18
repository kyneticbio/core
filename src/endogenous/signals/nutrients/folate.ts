import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const folate: SignalDefinition = {
  key: "folate",
  type: "nutrient",
  label: "Folate",
  unit: "ng/mL",
  isPremium: true,
  description: "Essential for cell division.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.nutritional?.folate_ng_mL;
      if (bw != null) return bw;
      const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
      return 12 * ageFactor;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.nutritional?.folate_ng_mL;
    if (bw != null) return bw;
    const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
    return 12 * ageFactor;
  },
  display: {
    referenceRange: { min: 4, max: 20 },
  },
  monitors: [
    {
      id: "low_folate",
      signal: "folate",
      pattern: { type: "falls_below", value: 4, sustainedMins: 10080 },
      outcome: "warning",
      message: "Folate Deficiency",
      description: "Low folate affects cell repair and mood.",
    },
  ],
};
