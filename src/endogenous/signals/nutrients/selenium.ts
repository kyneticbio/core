import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const selenium: SignalDefinition = {
  key: "selenium",
  type: "nutrient",
  label: "Selenium",
  unit: "µg/L",
  isPremium: true,
  description: "Antioxidant mineral.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.nutritional?.selenium_ug_L;
      if (bw != null) return bw;
      const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
      return 120 * ageFactor;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.nutritional?.selenium_ug_L;
    if (bw != null) return bw;
    const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
    return 120 * ageFactor;
  },
  display: {
    referenceRange: { min: 70, max: 150 },
  },
  monitors: [
    {
      id: "low_selenium",
      signal: "selenium",
      pattern: { type: "falls_below", value: 70, sustainedMins: 10080 },
      outcome: "warning",
      message: "Low Selenium",
      description:
        "Selenium is vital for antioxidant defense and thyroid health.",
    },
  ],
};
