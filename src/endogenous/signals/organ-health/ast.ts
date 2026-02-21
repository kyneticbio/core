import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const ast: SignalDefinition = {
  key: "ast",
  type: "organ-health",
  label: "AST",
  unit: "U/L",
  isPremium: true,
  description: "Aspartate Aminotransferase. Liver/muscle health marker.",
  idealTendency: "lower",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.metabolic?.ast_U_L;
      if (bw != null) return bw;
      return ctx.subject.sex === "male" ? 24 : 20;
    },
    tau: 2880,
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state: any, ctx: DynamicsContext) => {
          const inflammation = state.signals.inflammation ?? 1.0;
          const ethanol = state.signals.ethanol ?? 0;
          const burnRate = state.signals.burnRate ?? 1.15;
          let damage = 0;

          let inflammationDamage = 0;
          if (inflammation > 2.0) inflammationDamage += (inflammation - 2.0) * 0.4;
          const ldh = ctx.subject.bloodwork?.metabolic?.ldh_U_L;
          if (ldh !== undefined && ldh > 200) {
            inflammationDamage *= (1 + Math.min(0.5, (ldh - 200) / 200));
          }
          damage += inflammationDamage;

          if (ethanol > 50) {
            let alcoholDamage = (ethanol - 50) * 0.015;
            const ggt = ctx.subject.bloodwork?.metabolic?.ggt_U_L;
            if (ggt !== undefined && ggt > 50) {
              const ggtMultiplier = 1 + Math.min(2.0, (ggt - 50) / 50);
              alcoholDamage *= ggtMultiplier;
            }
            damage += alcoholDamage;
          }

          if (burnRate > 5) damage += (burnRate - 5) * 0.1;
          return damage;
        },
      },
    ],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.metabolic?.ast_U_L;
    if (bw != null) return bw;
    return ctx.subject.sex === "male" ? 24 : 20;
  },
  display: {
    referenceRange: { min: 0, max: 40 },
  },
  monitors: [
    {
      id: "high_ast",
      signal: "ast",
      pattern: { type: "exceeds", value: 45, sustainedMins: 1440 },
      outcome: "warning",
      message: "Elevated AST",
      description:
        "AST is elevated, which can indicate liver or muscle stress.",
    },
  ],
};
