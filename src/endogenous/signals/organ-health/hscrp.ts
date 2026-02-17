import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const hsCRP: SignalDefinition = {
  key: "hsCRP",
  label: "hs-CRP",
  unit: "mg/L",
  isPremium: true,
  description:
    "High-sensitivity C-reactive protein. A marker of systemic inflammation linked to cardiovascular risk.",
  idealTendency: "lower",
  dynamics: {
    setpoint: (ctx, state) =>
      ctx.subject.bloodwork?.inflammation?.hsCRP_mg_L ?? 1.0,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => ctx.subject.bloodwork?.inflammation?.hsCRP_mg_L ?? 1.0,
  display: {
    referenceRange: { min: 0, max: 3.0 },
  },
  monitors: [
    {
      id: "elevated_hscrp",
      signal: "hsCRP",
      pattern: { type: "exceeds", value: 3.0, sustainedMins: 1440 },
      outcome: "warning",
      message: "Elevated Inflammation (hs-CRP)",
      description:
        "hs-CRP above 3.0 mg/L indicates increased cardiovascular risk and systemic inflammation.",
    },
  ],
};
