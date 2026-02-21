import type { SignalDefinition, DynamicsContext } from "../../../engine";
import { getMenstrualHormones } from "../../utils";

export const estrogen: SignalDefinition = {
  key: "estrogen",
  type: "hormone",
  label: "Estrogen",
  isPremium: true,
  unit: "pg/mL",
  description:
    "The primary female sex hormone, vital for brain health and mood.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      if (ctx.subject.sex === "male") {
        return ctx.subject.bloodwork?.hormones?.estradiol_pg_mL ?? 30.0;
      }
      // Scale cycle rhythm around subject's baseline if bloodwork available
      let baselineE2 = ctx.subject.bloodwork?.hormones?.estradiol_pg_mL;
      if (baselineE2 == null && ctx.subject.age >= 50 && ctx.subject.bloodwork?.hormones?.estrone_pg_mL != null) {
        baselineE2 = ctx.subject.bloodwork.hormones.estrone_pg_mL * 0.4;
      }
      baselineE2 = baselineE2 ?? 40;
      const scale = baselineE2 / 40;
      const cycleLength = ctx.subject.cycleLength || 28;
      const cycleDay =
        (ctx.subject.cycleDay || 0) +
        Math.floor(ctx.circadianMinuteOfDay / 1440);
      const effectiveDay = cycleDay % cycleLength;
      return (
        (20.0 +
          250.0 *
            getMenstrualHormones(
              effectiveDay,
              cycleLength,
              ctx.subject.lutealPhaseLength ?? 14,
            ).estrogen) *
        scale
      );
    },
    tau: 120,
    production: [],
    clearance: [{ type: "linear", rate: 0.008 }],
    couplings: [],
  },
  initialValue: (ctx) => {
    let baselineE2 = ctx.subject.bloodwork?.hormones?.estradiol_pg_mL;
    if (baselineE2 == null && ctx.subject.age >= 50 && ctx.subject.bloodwork?.hormones?.estrone_pg_mL != null) {
      baselineE2 = ctx.subject.bloodwork.hormones.estrone_pg_mL * 0.4;
    }
    return baselineE2 ?? 40;
  },
  display: {
    referenceRange: { min: 50, max: 400 },
  },
  monitors: [
    {
      id: "estrogen_dominance",
      signal: "estrogen",
      pattern: { type: "exceeds", value: 450, sustainedMins: 1440 },
      outcome: "warning",
      message: "High Estrogen (Estrogen Dominance)",
      description:
        "Elevated estrogen can cause water retention, mood swings, and other issues if not balanced by progesterone.",
    },
    {
      id: "estrogen_deficiency",
      signal: "estrogen",
      pattern: { type: "falls_below", value: 20, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low Estrogen",
      description:
        "Very low estrogen can affect mood, bone density, and cognitive function.",
    },
  ],
};
