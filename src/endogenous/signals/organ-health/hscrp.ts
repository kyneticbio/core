import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const hsCRP: SignalDefinition = {
  key: "hsCRP",
  type: "organ-health",
  label: "hs-CRP",
  unit: "mg/L",
  isPremium: true,
  description:
    "High-sensitivity C-reactive protein. A marker of systemic inflammation linked to cardiovascular risk.",
  idealTendency: "lower",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.inflammation?.hsCRP_mg_L;
      if (bw != null) return bw;
      const bmiFactor = ctx.physiology.bmi <= 25 ? 1.0 : 1.0 + (ctx.physiology.bmi - 25) * 0.03;
      const ageFactor = 1.0 + Math.max(0, ctx.subject.age - 40) * 0.005;
      return 1.0 * bmiFactor * ageFactor;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.inflammation?.hsCRP_mg_L;
    if (bw != null) return bw;
    const bmiFactor = ctx.physiology.bmi <= 25 ? 1.0 : 1.0 + (ctx.physiology.bmi - 25) * 0.03;
    const ageFactor = 1.0 + Math.max(0, ctx.subject.age - 40) * 0.005;
    return 1.0 * bmiFactor * ageFactor;
  },
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
