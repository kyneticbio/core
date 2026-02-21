import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const tsh: SignalDefinition = {
  key: "tsh",
  type: "hormone",
  label: "TSH",
  unit: "µIU/mL",
  isPremium: true,
  description:
    "Thyroid-stimulating hormone. Controls thyroid gland activity. Elevated TSH suggests underactive thyroid.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.hormones?.tsh_uIU_mL;
      if (bw != null) return bw;
      const ageFactor = 1.0 + Math.max(0, ctx.subject.age - 40) * 0.005;
      const sexFactor = ctx.subject.sex === "female" ? 1.05 : 1.0;
      const bmiFactor = ctx.physiology.bmi <= 25 ? 1.0 : 1.0 + (ctx.physiology.bmi - 25) * 0.01;
      const trab = ctx.subject.bloodwork?.hormones?.trab_IU_L;
      const trabF = trab !== undefined && trab > 1.75 ? Math.max(0.1, 1 - Math.min(0.9, (trab - 1.75) * 0.1)) : 1.0;
      return 2.0 * ageFactor * sexFactor * bmiFactor * trabF;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [{ source: "thyroid", effect: "inhibit", strength: 0.001 }],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.hormones?.tsh_uIU_mL;
    if (bw != null) return bw;
    const ageFactor = 1.0 + Math.max(0, ctx.subject.age - 40) * 0.005;
    const sexFactor = ctx.subject.sex === "female" ? 1.05 : 1.0;
    const bmiFactor = ctx.physiology.bmi <= 25 ? 1.0 : 1.0 + (ctx.physiology.bmi - 25) * 0.01;
    const trab = ctx.subject.bloodwork?.hormones?.trab_IU_L;
    const trabF = trab !== undefined && trab > 1.75 ? Math.max(0.1, 1 - Math.min(0.9, (trab - 1.75) * 0.1)) : 1.0;
    return 2.0 * ageFactor * sexFactor * bmiFactor * trabF;
  },
  display: {
    referenceRange: { min: 0.4, max: 4.0 },
  },
  monitors: [
    {
      id: "high_tsh",
      signal: "tsh",
      pattern: { type: "exceeds", value: 4.0, sustainedMins: 10080 },
      outcome: "warning",
      message: "Elevated TSH (Hypothyroidism)",
      description:
        "High TSH suggests the thyroid is underactive and not producing enough thyroid hormones.",
    },
    {
      id: "low_tsh",
      signal: "tsh",
      pattern: { type: "falls_below", value: 0.4, sustainedMins: 10080 },
      outcome: "warning",
      message: "Suppressed TSH (Hyperthyroidism)",
      description: "Low TSH may indicate excess thyroid hormone production.",
    },
  ],
};
