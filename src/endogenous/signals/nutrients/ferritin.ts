import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const ferritin: SignalDefinition = {
  key: "ferritin",
  label: "Ferritin",
  unit: "ng/mL",
  isPremium: true,
  description:
    "A measure of your body's stored iron. Adequate ferritin is essential for producing healthy red blood cells and ensuring your brain and muscles have enough oxygen to function properly.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) =>
      ctx.subject.bloodwork?.inflammation?.ferritin_ng_mL ?? 50,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) =>
    ctx.subject.bloodwork?.inflammation?.ferritin_ng_mL ?? 50,
  display: {
    referenceRange: { min: 30, max: 300 },
  },
  monitors: [
    {
      id: "low_ferritin",
      signal: "ferritin",
      pattern: { type: "falls_below", value: 30, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low Iron Stores (Ferritin)",
      description: "Insufficient iron stores can lead to anemia and fatigue.",
    },
  ],
};
