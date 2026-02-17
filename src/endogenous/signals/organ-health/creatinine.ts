import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const creatinine: SignalDefinition = {
  key: "creatinine",
  label: "Creatinine",
  unit: "mg/dL",
  isPremium: true,
  description:
    "A waste product from muscle metabolism filtered by the kidneys. Elevated levels suggest impaired kidney function.",
  idealTendency: "lower",
  dynamics: {
    setpoint: (ctx, state) =>
      ctx.subject.bloodwork?.metabolic?.creatinine_mg_dL ?? 0.9,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) =>
    ctx.subject.bloodwork?.metabolic?.creatinine_mg_dL ?? 0.9,
  display: {
    referenceRange: { min: 0.6, max: 1.2 },
  },
  monitors: [
    {
      id: "high_creatinine",
      signal: "creatinine",
      pattern: { type: "exceeds", value: 1.3, sustainedMins: 1440 },
      outcome: "warning",
      message: "Elevated Creatinine",
      description: "Elevated creatinine may indicate impaired kidney function.",
    },
  ],
};
