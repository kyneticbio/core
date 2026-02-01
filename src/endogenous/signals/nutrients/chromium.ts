import type { SignalDefinition } from "../../../engine";

export const chromium: SignalDefinition = {
  key: "chromium",
  label: "Chromium",
  unit: "x",
  isPremium: true,
  description: "Blood sugar management.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => 1.0,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: 1.0,
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
      description: "Chromium supports insulin sensitivity and glucose metabolism.",
    },
  ],
};
