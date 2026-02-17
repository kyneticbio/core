import type { SignalDefinition } from "../../../engine";

export const egfr: SignalDefinition = {
  key: "egfr",
  label: "eGFR",
  unit: "mL/min/1.73m²",
  isPremium: true,
  description: "Estimated Glomerular Filtration Rate. Kidney function marker.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx, state) => ctx.subject?.bloodwork?.metabolic?.eGFR_mL_min ?? 100,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => ctx.subject?.bloodwork?.metabolic?.eGFR_mL_min ?? 100,
  display: {
    referenceRange: { min: 90, max: 120 },
  },
  monitors: [
    {
      id: "low_egfr",
      signal: "egfr",
      pattern: { type: "falls_below", value: 60, sustainedMins: 1440 },
      outcome: "critical",
      message: "Low Kidney Function (eGFR)",
      description: "Kidney filtration rate is significantly low.",
    },
  ],
};
