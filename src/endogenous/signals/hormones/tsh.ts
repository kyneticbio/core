import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const tsh: SignalDefinition = {
  key: "tsh",
  label: "TSH",
  unit: "µIU/mL",
  isPremium: true,
  description:
    "Thyroid-stimulating hormone. Controls thyroid gland activity. Elevated TSH suggests underactive thyroid.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) =>
      ctx.subject.bloodwork?.hormones?.tsh_uIU_mL ?? 2.0,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [{ source: "thyroid", effect: "inhibit", strength: 0.001 }],
  },
  initialValue: (ctx) => ctx.subject.bloodwork?.hormones?.tsh_uIU_mL ?? 2.0,
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
