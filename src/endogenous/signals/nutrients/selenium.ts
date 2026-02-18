import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const selenium: SignalDefinition = {
  key: "selenium",
  label: "Selenium",
  unit: "µg/L",
  isPremium: true,
  description: "Antioxidant mineral.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) =>
      ctx.subject.bloodwork?.nutritional?.selenium_ug_L ?? 120,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) =>
    ctx.subject.bloodwork?.nutritional?.selenium_ug_L ?? 120,
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
