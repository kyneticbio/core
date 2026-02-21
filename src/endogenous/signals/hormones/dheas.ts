import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const dheas: SignalDefinition = {
  key: "dheas",
  type: "hormone",
  label: "DHEA-S",
  unit: "µg/dL",
  isPremium: true,
  description: "A precursor to sex hormones.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.hormones?.dheas_ug_dL;
      if (bw != null) return bw;
      const sexDefault = ctx.subject.sex === "male" ? 250 : 180;
      const ageFactor = Math.max(0.2, 1.0 - Math.max(0, ctx.subject.age - 25) * 0.015);
      const preg = ctx.subject.bloodwork?.hormones?.pregnenolone_ng_dL;
      const pregF = (preg !== undefined && preg < 50) ? Math.max(0.8, preg / 50) : 1.0;
      return sexDefault * ageFactor * pregF;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.hormones?.dheas_ug_dL;
    if (bw != null) return bw;
    const sexDefault = ctx.subject.sex === "male" ? 250 : 180;
    const ageFactor = Math.max(0.2, 1.0 - Math.max(0, ctx.subject.age - 25) * 0.015);
    const preg = ctx.subject.bloodwork?.hormones?.pregnenolone_ng_dL;
    const pregF = (preg !== undefined && preg < 50) ? Math.max(0.8, preg / 50) : 1.0;
    return sexDefault * ageFactor * pregF;
  },
  display: {
    referenceRange: { min: 100, max: 500 },
  },
  monitors: [
    {
      id: "low_dheas",
      signal: "dheas",
      pattern: { type: "falls_below", value: 100, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low DHEA-S",
      description:
        "Low DHEA-S is often associated with aging and reduced adrenal reserve.",
    },
  ],
};
