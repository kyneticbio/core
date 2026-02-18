import type { SignalDefinition, DynamicsContext } from "../../../engine";
import {
  minuteToPhase,
  hourToPhase,
  gaussianPhase,
  widthToConcentration,
} from "../../utils";

export const testosterone: SignalDefinition = {
  key: "testosterone",
  label: "Testosterone",
  isPremium: true,
  unit: "ng/dL",
  description:
    "The primary male sex hormone, foundational for muscle mass, bone density, and drive.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = Math.max(
        0.5,
        1 - Math.max(0, ctx.subject.age - 30) * 0.01,
      );
      if (ctx.subject.sex === "male") {
        // Scale circadian rhythm around subject's baseline if bloodwork available
        const baselineT =
          ctx.subject.bloodwork?.hormones?.total_testosterone_ng_dL ?? 500;
        const scale = baselineT / 500;
        const p = minuteToPhase(ctx.circadianMinuteOfDay);
        const circadian =
          400.0 +
          300.0 * gaussianPhase(p, hourToPhase(8), widthToConcentration(240));
        const zincVal = state?.signals?.zinc;
        const zinc = zincVal > 0 ? zincVal : 90;
        const zincFactor = zinc >= 70 ? 1.0 : Math.max(0.6, zinc / 70);
        return circadian * ageFactor * scale * zincFactor;
      } else {
        const baselineT =
          ctx.subject.bloodwork?.hormones?.total_testosterone_ng_dL ?? 40;
        return baselineT * ageFactor;
      }
    },
    tau: 60,
    production: [],
    clearance: [{ type: "linear", rate: 0.015 }],
    couplings: [],
  },
  initialValue: (ctx) =>
    ctx.subject.bloodwork?.hormones?.total_testosterone_ng_dL ?? 500,
  display: {
    referenceRange: { min: 300, max: 1000 },
  },
  monitors: [
    {
      id: "low_testosterone",
      signal: "testosterone",
      pattern: { type: "falls_below", value: 300, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low Testosterone detected",
      description:
        "Testosterone is below the healthy range. This can affect drive, muscle mass, and mood.",
    },
    {
      id: "peak_testosterone",
      signal: "testosterone",
      pattern: { type: "exceeds", value: 800, sustainedMins: 60 },
      outcome: "win",
      message: "Optimal Testosterone Drive",
      description:
        "Testosterone is in the upper healthy range, supporting physical performance and recovery.",
    },
  ],
};
