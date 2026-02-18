import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const creatinine: SignalDefinition = {
  key: "creatinine",
  type: "organ-health",
  label: "Creatinine",
  unit: "mg/dL",
  isPremium: true,
  description:
    "A waste product from muscle metabolism filtered by the kidneys. Elevated levels suggest impaired kidney function.",
  idealTendency: "lower",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.metabolic?.creatinine_mg_dL;
      if (bw != null) return bw;
      const sexDefault = ctx.subject.sex === "male" ? 1.0 : 0.8;
      return sexDefault;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.metabolic?.creatinine_mg_dL;
    if (bw != null) return bw;
    const sexDefault = ctx.subject.sex === "male" ? 1.0 : 0.8;
    return sexDefault;
  },
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
