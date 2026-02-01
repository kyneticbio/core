import type { SignalDefinition } from "../../../engine";

export const iron: SignalDefinition = {
  key: "iron",
  label: "Serum Iron",
  unit: "µg/dL",
  isPremium: true,
  description: "Oxygen transport component.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => 100,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: 100,
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
