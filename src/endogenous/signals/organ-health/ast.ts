import type { SignalDefinition } from "../../../engine";

export const ast: SignalDefinition = {
  key: "ast",
  label: "AST",
  unit: "U/L",
  isPremium: true,
  description: "Aspartate Aminotransferase. Liver/muscle health marker.",
  idealTendency: "lower",
  dynamics: {
    setpoint: (ctx, state) => 22,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: 22,
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
      description: "AST is elevated, which can indicate liver or muscle stress.",
    },
  ],
};
