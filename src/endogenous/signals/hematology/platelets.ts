import type { SignalDefinition } from "../../../engine";

export const platelets: SignalDefinition = {
  key: "platelets",
  label: "Platelets",
  unit: "K/µL",
  isPremium: true,
  description: "Cell fragments essential for blood clotting. Abnormal counts can indicate bleeding or clotting disorders.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => ctx.subject?.bloodwork?.hematology?.platelet_count_k_uL ?? 250,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => ctx.subject?.bloodwork?.hematology?.platelet_count_k_uL ?? 250,
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
