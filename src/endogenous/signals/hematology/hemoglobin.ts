import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const hemoglobin: SignalDefinition = {
  key: "hemoglobin",
  label: "Hemoglobin",
  unit: "g/dL",
  isPremium: true,
  description:
    "The oxygen-carrying protein in red blood cells. Low hemoglobin indicates anemia.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) =>
      ctx.subject.bloodwork?.hematology?.hemoglobin_g_dL ?? 14.5,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) =>
    ctx.subject.bloodwork?.hematology?.hemoglobin_g_dL ?? 14.5,
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
