import type { SignalDefinition } from "../../../engine";

export const folate: SignalDefinition = {
  key: "folate",
  label: "Folate",
  unit: "ng/mL",
  isPremium: true,
  description: "Essential for cell division.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => 12,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: 12,
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
