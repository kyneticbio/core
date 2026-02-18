import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const shbg: SignalDefinition = {
  key: "shbg",
  type: "hormone",
  label: "SHBG",
  unit: "nmol/L",
  isPremium: true,
  description: "Sex Hormone Binding Globulin.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.hormones?.shbg_nmol_L;
      if (bw != null) return bw;
      const sexDefault = ctx.subject.sex === "female" ? 70 : 40;
      const ageFactor = 1.0 + Math.max(0, ctx.subject.age - 30) * 0.005;
      const bmiFactor = ctx.physiology.bmi <= 25 ? 1.0 : Math.max(0.5, 1.0 - (ctx.physiology.bmi - 25) * 0.03);
      return sexDefault * ageFactor * bmiFactor;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.hormones?.shbg_nmol_L;
    if (bw != null) return bw;
    const sexDefault = ctx.subject.sex === "female" ? 70 : 40;
    const ageFactor = 1.0 + Math.max(0, ctx.subject.age - 30) * 0.005;
    const bmiFactor = ctx.physiology.bmi <= 25 ? 1.0 : Math.max(0.5, 1.0 - (ctx.physiology.bmi - 25) * 0.03);
    return sexDefault * ageFactor * bmiFactor;
  },
  display: {
    referenceRange: { min: 20, max: 100 },
  },
  monitors: [
    {
      id: "high_shbg",
      signal: "shbg",
      pattern: { type: "exceeds", value: 100, sustainedMins: 1440 },
      outcome: "warning",
      message: "High SHBG",
      description:
        "Elevated SHBG can bind up sex hormones, reducing the amount of 'free' testosterone and estrogen available to tissues.",
    },
  ],
};
