import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const hematocrit: SignalDefinition = {
  key: "hematocrit",
  type: "hematology",
  label: "Hematocrit",
  unit: "%",
  isPremium: true,
  description:
    "The percentage of blood volume occupied by red blood cells. Reflects hydration and red cell mass.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      let bw = ctx.subject.bloodwork?.hematology?.hematocrit_pct;
      if (bw == null) {
        const rbc = ctx.subject.bloodwork?.hematology?.rbc_count_m_uL;
        const mcv = ctx.subject.bloodwork?.hematology?.mcv_fL;
        if (rbc !== undefined && mcv !== undefined) {
          bw = (rbc * mcv) / 10;
        }
      }
      if (bw != null) return bw;
      return ctx.subject.sex === "male" ? 45 : 40;
    },
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [{ source: "hemoglobin", effect: "stimulate", strength: 0.01 }],
  },
  initialValue: (ctx) => {
    let bw = ctx.subject.bloodwork?.hematology?.hematocrit_pct;
    if (bw == null) {
      const rbc = ctx.subject.bloodwork?.hematology?.rbc_count_m_uL;
      const mcv = ctx.subject.bloodwork?.hematology?.mcv_fL;
      if (rbc !== undefined && mcv !== undefined) {
        bw = (rbc * mcv) / 10;
      }
    }
    if (bw != null) return bw;
    return ctx.subject.sex === "male" ? 45 : 40;
  },
  display: {
    referenceRange: { min: 36, max: 54 },
  },
  monitors: [
    {
      id: "low_hematocrit",
      signal: "hematocrit",
      pattern: { type: "falls_below", value: 36, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low Hematocrit",
      description:
        "Low hematocrit may indicate anemia, blood loss, or overhydration.",
    },
    {
      id: "high_hematocrit",
      signal: "hematocrit",
      pattern: { type: "exceeds", value: 54, sustainedMins: 1440 },
      outcome: "warning",
      message: "Elevated Hematocrit",
      description:
        "High hematocrit increases blood viscosity and cardiovascular risk.",
    },
  ],
};
