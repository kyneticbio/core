import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const iron: SignalDefinition = {
  key: "iron",
  type: "nutrient",
  label: "Serum Iron",
  unit: "µg/dL",
  isPremium: true,
  description: "Oxygen transport component.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      let bwIron = ctx.subject.bloodwork?.nutritional?.iron_ug_dL;
      if (bwIron == null) {
        const tibc = ctx.subject.bloodwork?.nutritional?.tibc_ug_dL;
        const tsat = ctx.subject.bloodwork?.nutritional?.transferrin_saturation_pct;
        if (tibc !== undefined && tsat !== undefined) {
          bwIron = (tsat / 100) * tibc;
        }
      }
      if (bwIron != null) return bwIron;
      const sexDefault = ctx.subject.sex === "male" ? 110 : 85;
      const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
      return sexDefault * ageFactor;
    },
    tau: 10080,
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state: any, ctx: DynamicsContext) => {
          const copper = state.signals.copper ?? 110;
          let copperF = copper >= 70 ? 1.0 : Math.max(0.5, copper / 70);

          const tsat = ctx.subject.bloodwork?.nutritional?.transferrin_saturation_pct;
          if (tsat !== undefined && tsat < 20) {
            copperF *= Math.max(0.7, tsat / 20);
          }
          
          const iron = state.signals.iron ?? 100;
          return iron * (copperF - 1.0) * 0.00005;
        },
      },
    ],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => {
    const bw = ctx.subject.bloodwork?.nutritional?.iron_ug_dL;
    if (bw != null) return bw;
    const sexDefault = ctx.subject.sex === "male" ? 110 : 85;
    const ageFactor = Math.max(0.85, 1.0 - Math.max(0, ctx.subject.age - 50) * 0.002);
    return sexDefault * ageFactor;
  },
  display: {
    referenceRange: { min: 60, max: 170 },
  },
  monitors: [
    {
      id: "low_iron",
      signal: "iron",
      pattern: { type: "falls_below", value: 60, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low Serum Iron",
      description: "Low iron can impair oxygen transport and cause fatigue.",
    },
  ],
};
