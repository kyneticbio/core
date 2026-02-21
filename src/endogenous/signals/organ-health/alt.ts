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
    tau: 2880,
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state: any, ctx: DynamicsContext) => {
          const inflammation = state.signals.inflammation ?? 1.0;
          const ethanol = state.signals.ethanol ?? 0;
          let damage = 0;
          if (inflammation > 2.0) damage += (inflammation - 2.0) * 0.5;

          if (ethanol > 50) {
            let alcoholDamage = (ethanol - 50) * 0.02;
            const ggt = ctx.subject.bloodwork?.metabolic?.ggt_U_L;
            if (ggt !== undefined && ggt > 50) {
              const ggtMultiplier = 1 + Math.min(2.0, (ggt - 50) / 50);
              alcoholDamage *= ggtMultiplier;
            }
            damage += alcoholDamage;
          }
          return damage;
        },
      },
    ],
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
