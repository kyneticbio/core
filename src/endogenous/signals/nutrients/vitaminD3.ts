import type { SignalDefinition } from "../../../engine";

export const vitaminD3: SignalDefinition = {
  key: "vitaminD3",
  label: "Vitamin D3",
  unit: "ng/mL",
  isPremium: true,
  description: "Essential hormone-like vitamin.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx: any, state: any) => ctx.subject?.bloodwork?.nutritional?.vitaminD3_ng_mL ?? 35,
    tau: 10080,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx: any) => ctx.subject?.bloodwork?.nutritional?.vitaminD3_ng_mL ?? 35,
  display: {
    referenceRange: { min: 30, max: 80 },
  },
  monitors: [
    {
      id: "low_vitamin_d",
      signal: "vitaminD3",
      pattern: { type: "falls_below", value: 30, sustainedMins: 10080 },
      outcome: "warning",
      message: "Vitamin D Deficiency",
      description: "Low Vitamin D affects immunity, bone health, and mood.",
    },
  ],
};
