import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const vitaminD3: SignalDefinition = {
  key: "vitaminD3",
  type: "nutrient",
  label: "Vitamin D3",
  unit: "ng/mL",
  isPremium: true,
  description: "Essential hormone-like vitamin.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.nutritional?.vitaminD3_ng_mL;
      if (bw != null) return bw;
      const bmiFactor = ctx.physiology.bmi <= 25 ? 1.0 : Math.max(0.6, 1.0 - (ctx.physiology.bmi - 25) * 0.02);
      const ageFactor = Math.max(0.7, 1.0 - Math.max(0, ctx.subject.age - 40) * 0.005);
      return 35 * bmiFactor * ageFactor;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.nutritional?.vitaminD3_ng_mL;
    if (bw != null) return bw;
    const bmiFactor = ctx.physiology.bmi <= 25 ? 1.0 : Math.max(0.6, 1.0 - (ctx.physiology.bmi - 25) * 0.02);
    const ageFactor = Math.max(0.7, 1.0 - Math.max(0, ctx.subject.age - 40) * 0.005);
    return 35 * bmiFactor * ageFactor;
  },
  display: {
    referenceRange: { min: 30, max: 80 },
  },
  monitors: [
    {
      id: "low_vitamin_d",
      signal: "vitaminD3",
      pattern: { type: "falls_below", value: 30, sustainedMins: 10080 },
      outcome: "warning",
      message: "Vitamin D Deficiency",
      description: "Low Vitamin D affects immunity, bone health, and mood.",
    },
  ],
};
