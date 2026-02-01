import type { SignalDefinition } from "../../../engine";

export const dheas: SignalDefinition = {
  key: "dheas",
  label: "DHEA-S",
  unit: "µg/dL",
  isPremium: true,
  description: "A precursor to sex hormones.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => 200,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: 200,
  display: {
    referenceRange: { min: 100, max: 500 },
  },
  monitors: [
    {
      id: "low_dheas",
      signal: "dheas",
      pattern: { type: "falls_below", value: 100, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low DHEA-S",
      description: "Low DHEA-S is often associated with aging and reduced adrenal reserve.",
    },
  ],
};
