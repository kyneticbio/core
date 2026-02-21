import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const egfr: SignalDefinition = {
  key: "egfr",
  type: "organ-health",
  label: "eGFR",
  unit: "mL/min/1.73m²",
  isPremium: true,
  description: "Estimated Glomerular Filtration Rate. Kidney function marker.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx, state) => {
      let bw = ctx.subject.bloodwork?.metabolic?.eGFR_mL_min;
      if (bw != null) {
        const macr = ctx.subject.bloodwork?.urinalysis?.microalbumin_creatinine_ratio_mg_g;
        if (macr !== undefined && macr > 30) {
          bw *= Math.max(0.85, 1 - Math.min(0.15, (macr - 30) / 300));
        }
        return bw;
      }
      
      const bun = ctx.subject.bloodwork?.metabolic?.bun_mg_dL;
      if (bun !== undefined && bun > 20) {
        return Math.max(30, 90 - (bun - 20) * 2);
      }
      
      return Math.max(60, 100 - Math.max(0, ctx.subject.age - 40) * 1.0);
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [{ source: "creatinine", effect: "inhibit", strength: 0.005 }],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.metabolic?.eGFR_mL_min;
    if (bw != null) return bw;

    const bun = ctx.subject.bloodwork?.metabolic?.bun_mg_dL;
    if (bun !== undefined && bun > 20) {
      return Math.max(30, 90 - (bun - 20) * 2);
    }
    
    return Math.max(60, 100 - Math.max(0, ctx.subject.age - 40) * 1.0);
  },
  display: {
    referenceRange: { min: 90, max: 120 },
  },
  monitors: [
    {
      id: "low_egfr",
      signal: "egfr",
      pattern: { type: "falls_below", value: 60, sustainedMins: 1440 },
      outcome: "critical",
      message: "Low Kidney Function (eGFR)",
      description: "Kidney filtration rate is significantly low.",
    },
  ],
};
