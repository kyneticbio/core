import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const albumin: SignalDefinition = {
  key: "albumin",
  type: "organ-health",
  label: "Albumin",
  unit: "g/dL",
  isPremium: true,
  description:
    "Major plasma protein produced by the liver. Important for drug binding and fluid balance.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      let bw = ctx.subject.bloodwork?.metabolic?.albumin_g_dL;
      if (bw == null) {
        const totalProtein = ctx.subject.bloodwork?.metabolic?.total_protein_g_dL;
        if (totalProtein != null) {
          bw = totalProtein * 0.6;
        }
      }
      if (bw != null) return bw;
      return Math.max(3.2, 4.0 - Math.max(0, ctx.subject.age - 50) * 0.01);
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [{ source: "hsCRP", effect: "inhibit", strength: 0.001 }],
  },
  initialValue: (ctx) => {
    let bw = ctx.subject.bloodwork?.metabolic?.albumin_g_dL;
    if (bw == null) {
      const totalProtein = ctx.subject.bloodwork?.metabolic?.total_protein_g_dL;
      if (totalProtein != null) {
        bw = totalProtein * 0.6;
      }
    }
    if (bw != null) return bw;
    return Math.max(3.2, 4.0 - Math.max(0, ctx.subject.age - 50) * 0.01);
  },
  display: {
    referenceRange: { min: 3.5, max: 5.0 },
  },
  monitors: [
    {
      id: "low_albumin",
      signal: "albumin",
      pattern: { type: "falls_below", value: 3.5, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low Albumin",
      description:
        "Low albumin may indicate liver dysfunction or malnutrition, and affects drug distribution.",
    },
  ],
};
