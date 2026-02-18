import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const wbc: SignalDefinition = {
  key: "wbc",
  label: "WBC",
  unit: "K/µL",
  isPremium: true,
  description:
    "White blood cell count. A marker of immune system activity and infection status.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) =>
      ctx.subject.bloodwork?.hematology?.wbc_count_k_uL ?? 7.0,
    tau: 10080,
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state: any) => {
          const vitD = state.signals.vitaminD3 || 35;
          const zinc = state.signals.zinc || 90;
          const vitDF = vitD >= 30 ? 1.0 : Math.max(0.7, vitD / 30);
          const zincF = zinc >= 70 ? 1.0 : Math.max(0.7, zinc / 70);
          const efficiency = vitDF * zincF;
          const wbc = state.signals.wbc ?? 7.0;
          return wbc * (efficiency - 1.0) * 0.00005;
        },
      },
    ],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) =>
    ctx.subject.bloodwork?.hematology?.wbc_count_k_uL ?? 7.0,
  display: {
    referenceRange: { min: 4.5, max: 11.0 },
  },
  monitors: [
    {
      id: "low_wbc",
      signal: "wbc",
      pattern: { type: "falls_below", value: 4.0, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low WBC (Leukopenia)",
      description:
        "Low white blood cell count may indicate immune suppression.",
    },
    {
      id: "high_wbc",
      signal: "wbc",
      pattern: { type: "exceeds", value: 11.0, sustainedMins: 1440 },
      outcome: "warning",
      message: "Elevated WBC (Leukocytosis)",
      description:
        "Elevated white blood cell count may indicate infection or inflammation.",
    },
  ],
};
