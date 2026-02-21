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
    tau: 4320,
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state: any, ctx: DynamicsContext) => {
          const hb = state.signals.hemoglobin ?? 14.5;
          let baseProduction = hb * 0.00002;
          
          const indirect = ctx.subject.bloodwork?.metabolic?.indirect_bilirubin_mg_dL;
          const total = ctx.subject.bloodwork?.metabolic?.bilirubin_mg_dL;
          if (indirect !== undefined && total !== undefined && total > 0) {
            const fraction = indirect / total;
            if (fraction > 0.85) {
              const hemolysisF = 1 + (fraction - 0.85) * 5;
              baseProduction *= hemolysisF;
            }
          }
          return baseProduction;
        },
      },
    ],
    clearance: [],
    couplings: [{ source: "inflammation", effect: "stimulate", strength: 0.001 }],
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
