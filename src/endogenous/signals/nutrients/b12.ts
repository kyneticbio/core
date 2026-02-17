import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const b12: SignalDefinition = {
  key: "b12",
  label: "Vitamin B12",
  unit: "pg/mL",
  isPremium: true,
  description: "Essential for nerve health.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) =>
      ctx.subject.bloodwork?.nutritional?.b12_pg_mL ?? 500,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => ctx.subject.bloodwork?.nutritional?.b12_pg_mL ?? 500,
  display: {
    referenceRange: { min: 200, max: 900 },
  },
  monitors: [
    {
      id: "low_b12",
      signal: "b12",
      pattern: { type: "falls_below", value: 200, sustainedMins: 10080 },
      outcome: "warning",
      message: "B12 Deficiency",
      description: "Low B12 can affect energy levels and nerve health.",
    },
  ],
};
