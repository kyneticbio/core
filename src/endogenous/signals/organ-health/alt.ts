import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const alt: SignalDefinition = {
  key: "alt",
  type: "organ-health",
  label: "ALT",
  unit: "U/L",
  isPremium: true,
  description: "Alanine Aminotransferase. Liver stress marker.",
  idealTendency: "lower",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.metabolic?.alt_U_L;
      if (bw != null) return bw;
      return ctx.subject.sex === "male" ? 28 : 20;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.metabolic?.alt_U_L;
    if (bw != null) return bw;
    return ctx.subject.sex === "male" ? 28 : 20;
  },
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
