import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const hematocrit: SignalDefinition = {
  key: "hematocrit",
  label: "Hematocrit",
  unit: "%",
  isPremium: true,
  description:
    "The percentage of blood volume occupied by red blood cells. Reflects hydration and red cell mass.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) =>
      ctx.subject.bloodwork?.hematology?.hematocrit_pct ?? 43,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) =>
    ctx.subject.bloodwork?.hematology?.hematocrit_pct ?? 43,
  display: {
    referenceRange: { min: 36, max: 54 },
  },
  monitors: [
    {
      id: "low_hematocrit",
      signal: "hematocrit",
      pattern: { type: "falls_below", value: 36, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low Hematocrit",
      description:
        "Low hematocrit may indicate anemia, blood loss, or overhydration.",
    },
    {
      id: "high_hematocrit",
      signal: "hematocrit",
      pattern: { type: "exceeds", value: 54, sustainedMins: 1440 },
      outcome: "warning",
      message: "Elevated Hematocrit",
      description:
        "High hematocrit increases blood viscosity and cardiovascular risk.",
    },
  ],
};
