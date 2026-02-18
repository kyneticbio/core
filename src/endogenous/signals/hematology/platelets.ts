import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const platelets: SignalDefinition = {
  key: "platelets",
  type: "hematology",
  label: "Platelets",
  unit: "K/µL",
  isPremium: true,
  description:
    "Cell fragments essential for blood clotting. Abnormal counts can indicate bleeding or clotting disorders.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.hematology?.platelet_count_k_uL;
      if (bw != null) return bw;
      const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
      const sexFactor = ctx.subject.sex === "female" ? 1.05 : 1.0;
      return 250 * ageFactor * sexFactor;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.hematology?.platelet_count_k_uL;
    if (bw != null) return bw;
    const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
    const sexFactor = ctx.subject.sex === "female" ? 1.05 : 1.0;
    return 250 * ageFactor * sexFactor;
  },
  display: {
    referenceRange: { min: 150, max: 400 },
  },
  monitors: [
    {
      id: "low_platelets",
      signal: "platelets",
      pattern: { type: "falls_below", value: 150, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low Platelets (Thrombocytopenia)",
      description: "Low platelet count increases bleeding risk.",
    },
  ],
};
