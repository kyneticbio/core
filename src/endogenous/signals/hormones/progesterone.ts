import type { SignalDefinition } from "../../../engine";
import { getMenstrualHormones } from "../../utils";

export const progesterone: SignalDefinition = {
  key: "progesterone",
  label: "Progesterone",
  isPremium: true,
  unit: "ng/mL",
  description:
    "Rising in the second half of the cycle, has a calming effect on the brain.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx: any, state: any) => {
      if (ctx.subject.sex === "male") {
        return ctx.subject?.bloodwork?.hormones?.progesterone_ng_mL ?? 0.2;
      }
      // Scale cycle rhythm around subject's baseline if bloodwork available
      const baselineP4 = ctx.subject?.bloodwork?.hormones?.progesterone_ng_mL ?? 0.5;
      const scale = baselineP4 / 0.5;
      const cycleLength = ctx.subject.cycleLength || 28;
      const cycleDay =
        (ctx.subject.cycleDay || 0) +
        Math.floor(ctx.circadianMinuteOfDay / 1440);
      const effectiveDay = cycleDay % cycleLength;
      return (
        (0.2 +
        18.0 * getMenstrualHormones(effectiveDay, cycleLength).progesterone) * scale
      );
    },
    tau: 120,
    production: [],
    clearance: [{ type: "linear", rate: 0.008 }],
    couplings: [],
  },
  initialValue: (ctx: any) => ctx.subject?.bloodwork?.hormones?.progesterone_ng_mL ?? 0.5,
  display: {
    referenceRange: { min: 0.1, max: 20 },
  },
  monitors: [
    {
      id: "progesterone_luteal_peak",
      signal: "progesterone",
      pattern: { type: "exceeds", value: 10, sustainedMins: 1440 },
      outcome: "win",
      message: "Luteal Phase confirmed (High Progesterone)",
      description: "Strong progesterone levels indicate a healthy luteal phase and successful ovulation.",
    },
    {
      id: "progesterone_deficiency",
      signal: "progesterone",
      pattern: { type: "falls_below", value: 5, sustainedMins: 10080 }, // 7 days in late cycle
      outcome: "warning",
      message: "Potential Luteal Phase defect",
      description: "Low progesterone in the second half of your cycle can lead to anxiety, sleep issues, and PMS.",
    },
  ],
};
