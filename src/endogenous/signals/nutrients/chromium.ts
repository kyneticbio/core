import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const chromium: SignalDefinition = {
  key: "chromium",
  type: "nutrient",
  label: "Chromium",
  unit: "x",
  isPremium: true,
  description: "Blood sugar management.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.nutritional?.chromium_x;
      if (bw != null) return bw;
      const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
      return 1.0 * ageFactor;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.nutritional?.chromium_x;
    if (bw != null) return bw;
    const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
    return 1.0 * ageFactor;
  },
  display: {
    referenceRange: { min: 0.5, max: 1.5 },
  },
  monitors: [
    {
      id: "low_chromium",
      signal: "chromium",
      pattern: { type: "falls_below", value: 0.5, sustainedMins: 10080 },
      outcome: "warning",
      message: "Low Chromium",
      description:
        "Chromium supports insulin sensitivity and glucose metabolism.",
    },
  ],
};
