import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const potassium: SignalDefinition = {
  key: "potassium",
  type: "organ-health",
  label: "Potassium",
  unit: "mmol/L",
  isPremium: true,
  description:
    "An essential electrolyte critical for heart rhythm, muscle contraction, and nerve signaling.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const base = ctx.subject.bloodwork?.metabolic?.potassium_mmol_L ?? 4.2;
      const aldo = ctx.subject.bloodwork?.hormones?.aldosterone_ng_dL;
      const aldoF = aldo !== undefined && aldo > 15 ? Math.max(0.85, 1 - (aldo - 15) * 0.005) : 1.0;
      return base * aldoF;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [{ source: "egfr", effect: "inhibit", strength: 0.0005 }],
  },
  initialValue: (ctx) => {
    const base = ctx.subject.bloodwork?.metabolic?.potassium_mmol_L ?? 4.2;
    const aldo = ctx.subject.bloodwork?.hormones?.aldosterone_ng_dL;
    const aldoF = aldo !== undefined && aldo > 15 ? Math.max(0.85, 1 - (aldo - 15) * 0.005) : 1.0;
    return base * aldoF;
  },
  display: {
    referenceRange: { min: 3.5, max: 5.0 },
  },
  monitors: [
    {
      id: "low_potassium",
      signal: "potassium",
      pattern: { type: "falls_below", value: 3.5, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low Potassium (Hypokalemia)",
      description:
        "Low potassium can cause muscle weakness and cardiac arrhythmias.",
    },
    {
      id: "high_potassium",
      signal: "potassium",
      pattern: { type: "exceeds", value: 5.0, sustainedMins: 1440 },
      outcome: "critical",
      message: "High Potassium (Hyperkalemia)",
      description:
        "Elevated potassium can be dangerous and affect heart rhythm.",
    },
  ],
};
