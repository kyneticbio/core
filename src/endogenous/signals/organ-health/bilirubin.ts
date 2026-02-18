import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const bilirubin: SignalDefinition = {
  key: "bilirubin",
  type: "organ-health",
  label: "Bilirubin",
  unit: "mg/dL",
  isPremium: true,
  description:
    "A byproduct of red blood cell breakdown processed by the liver. Elevated levels may indicate liver or bile duct issues.",
  idealTendency: "lower",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.metabolic?.bilirubin_mg_dL;
      if (bw != null) return bw;
      return ctx.subject.sex === "male" ? 0.8 : 0.6;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.metabolic?.bilirubin_mg_dL;
    if (bw != null) return bw;
    return ctx.subject.sex === "male" ? 0.8 : 0.6;
  },
  display: {
    referenceRange: { min: 0.1, max: 1.2 },
  },
  monitors: [
    {
      id: "high_bilirubin",
      signal: "bilirubin",
      pattern: { type: "exceeds", value: 1.2, sustainedMins: 1440 },
      outcome: "warning",
      message: "Elevated Bilirubin",
      description:
        "Elevated bilirubin can indicate liver dysfunction or bile duct obstruction.",
    },
  ],
};
