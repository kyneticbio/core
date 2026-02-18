import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const choline: SignalDefinition = {
  key: "choline",
  label: "Choline",
  unit: "µmol/L",
  isPremium: true,
  description: "Acetylcholine precursor.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) =>
      ctx.subject.bloodwork?.nutritional?.choline_umol_L ?? 10,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) =>
    ctx.subject.bloodwork?.nutritional?.choline_umol_L ?? 10,
  display: {
    referenceRange: { min: 7, max: 20 },
  },
  monitors: [
    {
      id: "low_choline",
      signal: "choline",
      pattern: { type: "falls_below", value: 7, sustainedMins: 10080 },
      outcome: "warning",
      message: "Low Choline",
      description:
        "Choline is vital for liver health and brain function (ACh precursor).",
    },
  ],
};
