import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const ferritin: SignalDefinition = {
  key: "ferritin",
  type: "nutrient",
  label: "Ferritin",
  unit: "ng/mL",
  isPremium: true,
  description:
    "A measure of your body's stored iron. Adequate ferritin is essential for producing healthy red blood cells and ensuring your brain and muscles have enough oxygen to function properly.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.inflammation?.ferritin_ng_mL;
      if (bw != null) return bw;
      return ctx.subject.sex === "male" ? 120 : 50;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [{ source: "iron", effect: "stimulate", strength: 0.008 }],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.inflammation?.ferritin_ng_mL;
    if (bw != null) return bw;
    return ctx.subject.sex === "male" ? 120 : 50;
  },
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
