import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const hemoglobin: SignalDefinition = {
  key: "hemoglobin",
  type: "hematology",
  label: "Hemoglobin",
  unit: "g/dL",
  isPremium: true,
  description:
    "The oxygen-carrying protein in red blood cells. Low hemoglobin indicates anemia.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bw = ctx.subject.bloodwork?.hematology?.hemoglobin_g_dL;
      if (bw != null) return bw;
      const sexDefault = ctx.subject.sex === "male" ? 15.0 : 13.5;
      const ageFactor = Math.max(0.9, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
      return sexDefault * ageFactor;
    },
    tau: 10080,
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state: any) => {
          const iron = state.signals.iron || 100;
          const b12 = state.signals.b12 || 500;
          const folate = state.signals.folate || 12;
          // Sufficiency factors: 1.0 when adequate, drops when deficient
          const ironF = iron >= 60 ? 1.0 : Math.max(0.3, iron / 60);
          const b12F = b12 >= 300 ? 1.0 : Math.max(0.5, b12 / 300);
          const folateF = folate >= 4 ? 1.0 : Math.max(0.5, folate / 4);
          const efficiency = ironF * b12F * folateF;
          // When efficiency < 1, adds negative pull proportional to current value
          const hb = state.signals.hemoglobin ?? 14.5;
          return hb * (efficiency - 1.0) * 0.0001;
        },
      },
    ],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.hematology?.hemoglobin_g_dL;
    if (bw != null) return bw;
    const sexDefault = ctx.subject.sex === "male" ? 15.0 : 13.5;
    const ageFactor = Math.max(0.9, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
    return sexDefault * ageFactor;
  },
  display: {
    referenceRange: { min: 12.0, max: 17.5 },
  },
  monitors: [
    {
      id: "low_hemoglobin",
      signal: "hemoglobin",
      pattern: { type: "falls_below", value: 12.0, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low Hemoglobin (Anemia)",
      description:
        "Low hemoglobin reduces oxygen delivery to tissues, causing fatigue and weakness.",
    },
  ],
};
