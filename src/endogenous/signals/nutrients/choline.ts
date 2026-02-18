import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const choline: SignalDefinition = {
  key: "choline",
  type: "nutrient",
  label: "Choline",
  unit: "µmol/L",
  isPremium: true,
  description: "Acetylcholine precursor.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.nutritional?.choline_umol_L;
      if (bw != null) return bw;
      const sexDefault = ctx.subject.sex === "male" ? 11 : 9;
      const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
      return sexDefault * ageFactor;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.nutritional?.choline_umol_L;
    if (bw != null) return bw;
    const sexDefault = ctx.subject.sex === "male" ? 11 : 9;
    const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
    return sexDefault * ageFactor;
  },
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
