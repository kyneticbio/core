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
        transform: (_: any, state: any, ctx: DynamicsContext) => {
          const iron = state.signals.iron || 100;
          const b12 = state.signals.b12 || 500;
          const folate = state.signals.folate || 12;
          // Sufficiency factors: 1.0 when adequate, drops when deficient
          const ironF = iron >= 60 ? 1.0 : Math.max(0.3, iron / 60);
          const b12F = b12 >= 300 ? 1.0 : Math.max(0.5, b12 / 300);
          const folateF = folate >= 4 ? 1.0 : Math.max(0.5, folate / 4);
          let efficiency = ironF * b12F * folateF;

          const mcv = ctx.subject.bloodwork?.hematology?.mcv_fL;
          if (mcv !== undefined) {
             if (mcv < 80 && iron < 60) efficiency *= 0.8; // Confirms microcytic anemia
             else if (mcv > 100 && (b12 < 300 || folate < 4)) efficiency *= 0.8; // Confirms megaloblastic
          }

          // When efficiency < 1, adds negative pull proportional to current value
          const hb = state.signals.hemoglobin ?? 14.5;
          let change = hb * (efficiency - 1.0) * 0.0001;

          const retic = ctx.subject.bloodwork?.hematology?.reticulocyte_count_pct;
          if (retic !== undefined && retic > 1.5) {
            const reticBoost = 1 + Math.min(0.3, (retic - 1.5) * 0.1);
            if (change < 0) change /= reticBoost; // Mitigate loss
            else change += (hb * 0.00005 * (reticBoost - 1)); // Add gain
          }
          
          return change;
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
