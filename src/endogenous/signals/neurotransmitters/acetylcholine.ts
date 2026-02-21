import type { SignalDefinition, DynamicsContext } from "../../../engine";
import { minuteToPhase, hourToPhase, windowPhase } from "../../utils";

export const acetylcholine: SignalDefinition = {
  key: "acetylcholine",
  type: "neurotransmitter",
  label: "Acetylcholine",
  isPremium: true,
  unit: "nM",
  description:
    "A critical messenger for both your brain and your muscles. In the brain, it supports learning, memory, and sustained attention. It's often associated with 'speed of thought' and your ability to process new information quickly.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = Math.max(0.5, 1.0 - Math.max(0, ctx.subject.age - 30) * 0.007);
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const remDrive = ctx.isAsleep ? 0.8 : 0.4;
      const wakeFocus = windowPhase(p, hourToPhase(10), hourToPhase(12), 0.5);
      return (7.5 + 10.0 * wakeFocus + 7.5 * remDrive) * ageFactor;
    },
    tau: 45,
    production: [
      {
        source: "constant",
        coefficient: 0.01,
        transform: (_: any, state: any) => {
          const choline = state.signals.choline ?? 10;
          const cholineFactor = Math.min(1.0, choline / 7);
          return cholineFactor * 10;
        },
      },
    ],
    clearance: [{ type: "enzyme-dependent", rate: 0.02, enzyme: "AChE" }],
    couplings: [{ source: "orexin", effect: "stimulate", strength: 0.0375 }],
  },
  initialValue: 10,
  min: 0,
  max: 100,
  display: {
    referenceRange: { min: 1, max: 20 },
  },
  monitors: [
    {
      id: "acetylcholine_focus",
      signal: "acetylcholine",
      pattern: { type: "exceeds", value: 25, sustainedMins: 30 },
      outcome: "win",
      message: "Peak Cognitive Focus",
      description:
        "High acetylcholine supports learning, memory, and sustained attention.",
    },
  ],
};
