import type { SignalDefinition } from "../../../engine";

export const alt: SignalDefinition = {
  key: "alt",
  label: "ALT",
  unit: "U/L",
  isPremium: true,
  description: "Alanine Aminotransferase. Liver stress marker.",
  idealTendency: "lower",
  dynamics: {
    setpoint: (ctx, state) => ctx.subject?.bloodwork?.metabolic?.alt_U_L ?? 25,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => ctx.subject?.bloodwork?.metabolic?.alt_U_L ?? 25,
  display: {
    referenceRange: { min: 0, max: 40 },
  },
  monitors: [
    {
      id: "high_alt",
      signal: "alt",
      pattern: { type: "exceeds", value: 45, sustainedMins: 1440 },
      outcome: "warning",
      message: "Elevated Liver Stress (ALT)",
      description: "Elevated ALT can indicate liver inflammation or stress.",
    },
  ],
};
