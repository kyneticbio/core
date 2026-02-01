import type { SignalDefinition } from "../../../engine";

export const shbg: SignalDefinition = {
  key: "shbg",
  label: "SHBG",
  unit: "nmol/L",
  isPremium: true,
  description: "Sex Hormone Binding Globulin.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => 40,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: 40,
  display: {
    referenceRange: { min: 20, max: 100 },
  },
  monitors: [
    {
      id: "high_shbg",
      signal: "shbg",
      pattern: { type: "exceeds", value: 100, sustainedMins: 1440 },
      outcome: "warning",
      message: "High SHBG",
      description: "Elevated SHBG can bind up sex hormones, reducing the amount of 'free' testosterone and estrogen available to tissues.",
    },
  ],
};
