import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const iron: SignalDefinition = {
  key: "iron",
  type: "nutrient",
  label: "Serum Iron",
  unit: "µg/dL",
  isPremium: true,
  description: "Oxygen transport component.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.nutritional?.iron_ug_dL;
      if (bw != null) return bw;
      const sexDefault = ctx.subject.sex === "male" ? 110 : 85;
      const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
      return sexDefault * ageFactor;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.nutritional?.iron_ug_dL;
    if (bw != null) return bw;
    const sexDefault = ctx.subject.sex === "male" ? 110 : 85;
    const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
    return sexDefault * ageFactor;
  },
  display: {
    referenceRange: { min: 60, max: 170 },
  },
  monitors: [
    {
      id: "low_iron",
      signal: "iron",
      pattern: { type: "falls_below", value: 60, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low Serum Iron",
      description: "Low iron can impair oxygen transport and cause fatigue.",
    },
  ],
};
