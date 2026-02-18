import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const freeTestosterone: SignalDefinition = {
  key: "freeTestosterone",
  label: "Free Testosterone",
  unit: "pg/mL",
  isPremium: true,
  description: "Unbound testosterone available for tissue uptake.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.hormones?.free_testosterone_pg_mL;
      if (bw != null) return bw;
      return (ctx.subject?.sex ?? "male") === "male" ? 15 : 2;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.hormones?.free_testosterone_pg_mL;
    if (bw != null) return bw;
    return (ctx.subject?.sex ?? "male") === "male" ? 15 : 2;
  },
  display: {
    referenceRange: { min: 5, max: 25 },
  },
  monitors: [
    {
      id: "low_free_testosterone",
      signal: "freeTestosterone",
      pattern: { type: "falls_below", value: 5, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low Free Testosterone",
      description:
        "Low free testosterone may indicate hypogonadism or elevated SHBG binding.",
    },
  ],
};
