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
    tau: 10080,
    production: [],
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
