import type { SignalDefinition, DynamicsContext } from "../../../engine";
import { getMenstrualHormones } from "../../utils";

export const lh: SignalDefinition = {
  key: "lh",
  type: "hormone",
  label: "LH",
  isPremium: true,
  unit: "IU/L",
  description: "Luteinizing hormone, driver of ovulation in women.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      if (ctx.subject.sex === "male") {
        return ctx.subject.bloodwork?.hormones?.lh_IU_L ?? 5.0;
      }
      // Scale cycle rhythm around subject's baseline if bloodwork available
      const baselineLH = ctx.subject.bloodwork?.hormones?.lh_IU_L ?? 5.0;
      const scale = baselineLH / 5.0;
      const cycleLength = ctx.subject.cycleLength || 28;
      const cycleDay = (ctx.subject.cycleDay || 1) + (ctx.dayOfYear - 1);
      const effectiveDay = cycleDay % cycleLength;
      return (
        (2.0 +
          30.0 *
            getMenstrualHormones(
              effectiveDay,
              cycleLength,
              ctx.subject.lutealPhaseLength ?? 14,
            ).lh) *
        scale
      );
    },
    tau: 60,
    production: [],
    clearance: [],
    couplings: [],
  },
  initialValue: (ctx) => ctx.subject.bloodwork?.hormones?.lh_IU_L ?? 5,
  display: {
    referenceRange: { min: 2, max: 15 },
  },
  monitors: [
    {
      id: "lh_surge",
      signal: "lh",
      pattern: {
        type: "increases_by",
        amount: 8,
        mode: "absolute",
        windowMins: 1440,
      },
      outcome: "win",
      message: "LH Surge detected",
      description:
        "A sharp rise in Luteinizing Hormone indicates that ovulation is likely to occur in the next 24-36 hours.",
    },
  ],
};

export const fsh: SignalDefinition = {
  key: "fsh",
  type: "hormone",
  label: "FSH",
  isPremium: true,
  unit: "IU/L",
  description: "Follicle-stimulating hormone, regulates reproductive health.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      if (ctx.subject.sex === "male") {
        return ctx.subject.bloodwork?.hormones?.fsh_IU_L ?? 5.0;
      }
      // Scale cycle rhythm around subject's baseline if bloodwork available
      const baselineFSH = ctx.subject.bloodwork?.hormones?.fsh_IU_L ?? 5.0;
      const scale = baselineFSH / 5.0;
      const cycleLength = ctx.subject.cycleLength || 28;
      const cycleDay = (ctx.subject.cycleDay || 1) + (ctx.dayOfYear - 1);
      const effectiveDay = cycleDay % cycleLength;
      return (
        (3.0 +
          12.0 *
            getMenstrualHormones(
              effectiveDay,
              cycleLength,
              ctx.subject.lutealPhaseLength ?? 14,
            ).fsh) *
        scale
      );
    },
    tau: 60,
    production: [],
    clearance: [{ type: "linear", rate: 0.02 }],
    couplings: [],
  },
  initialValue: (ctx) => ctx.subject.bloodwork?.hormones?.fsh_IU_L ?? 5,
  display: {
    referenceRange: { min: 1, max: 10 },
  },
};
