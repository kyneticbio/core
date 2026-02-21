import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const b12: SignalDefinition = {
  key: "b12",
  type: "nutrient",
  label: "Vitamin B12",
  unit: "pg/mL",
  isPremium: true,
  description: "Essential for nerve health.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      let bw = ctx.subject.bloodwork?.nutritional?.b12_pg_mL;
      if (bw != null) {
        const mma = ctx.subject.bloodwork?.nutritional?.mma_nmol_L;
        if (mma !== undefined && mma > 370) {
          bw *= Math.max(0.6, 1 - (mma - 370) * 0.0005);
        }
      }
      if (bw != null) return bw;
      const ageFactor = Math.max(0.7, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.005);
      return 500 * ageFactor;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [{ source: "folate", effect: "stimulate", strength: 0.00003 }],
  },
  initialValue: (ctx) => {
    let bw = ctx.subject.bloodwork?.nutritional?.b12_pg_mL;
    if (bw != null) {
      const mma = ctx.subject.bloodwork?.nutritional?.mma_nmol_L;
      if (mma !== undefined && mma > 370) {
        bw *= Math.max(0.6, 1 - (mma - 370) * 0.0005);
      }
    }
    if (bw != null) return bw;
    const ageFactor = Math.max(0.7, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.005);
    return 500 * ageFactor;
  },
  display: {
    referenceRange: { min: 200, max: 900 },
  },
  monitors: [
    {
      id: "low_b12",
      signal: "b12",
      pattern: { type: "falls_below", value: 200, sustainedMins: 10080 },
      outcome: "warning",
      message: "B12 Deficiency",
      description: "Low B12 can affect energy levels and nerve health.",
    },
  ],
};
