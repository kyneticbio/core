import type {
  SignalDefinition,
  AuxiliaryDefinition,
  DynamicsContext,
} from "../../../engine";
import {
  minuteToPhase,
  hourToPhase,
  gaussianPhase,
  widthToConcentration,
} from "../../utils";

export const growthHormone: SignalDefinition = {
  key: "growthHormone",
  type: "hormone",
  label: "Growth Hormone",
  isPremium: true,
  unit: "ng/mL",
  description:
    "The primary 'repair and recovery' signal. Released mainly during deep sleep and after intense exercise.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const age = ctx.subject.age;
      const sex = ctx.subject.sex;
      const bmi = ctx.physiology.bmi;
      const ageFactor = Math.max(0.3, 1.0 - Math.max(0, age - 20) * 0.014);
      const sexFactor = sex === "female" ? 1.3 : 1.0;
      const bmiFactor = bmi <= 25 ? 1.0 : Math.max(0.4, 1.0 - (bmi - 25) * 0.04);
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const sleepOnset = gaussianPhase(
        p,
        hourToPhase(23.5),
        widthToConcentration(120),
      );
      const rebound = gaussianPhase(
        p,
        hourToPhase(3.0),
        widthToConcentration(90),
      );
      return (0.5 + 8.0 * (sleepOnset + 0.6 * rebound)) * ageFactor * sexFactor * bmiFactor;
    },
    tau: 20,
    production: [
      {
        source: "constant",
        coefficient: 1.0,
        transform: (_: any, state) => state.auxiliary.ghReserve ?? 0.8,
      },
    ],
    clearance: [{ type: "linear", rate: 0.05 }],
    couplings: [
      { source: "gaba", effect: "stimulate", strength: 0.002 },
      { source: "ghrelin", effect: "stimulate", strength: 0.0005 },
      { source: "cortisol", effect: "inhibit", strength: 0.0075 },
    ],
  },
  initialValue: 0.5,
  display: {
    referenceRange: { min: 0.1, max: 10 },
  },
  monitors: [
    {
      id: "gh_deep_sleep_pulse",
      signal: "growthHormone",
      pattern: { type: "exceeds", value: 6, sustainedMins: 20 },
      outcome: "win",
      message: "Anabolic Sleep Pulse (GH)",
      description:
        "Significant Growth Hormone release detected. This is vital for tissue repair and muscle growth.",
    },
    {
      id: "gh_suppression",
      signal: "growthHormone",
      pattern: { type: "falls_below", value: 0.2, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low Growth Hormone activity",
      description:
        "Chronic lack of GH pulses can impair recovery and body composition. Check sleep and stress levels.",
    },
  ],
};

export const ghReserve: AuxiliaryDefinition = {
  key: "ghReserve",
  type: "auxiliary",
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = Math.max(0.3, 1.0 - Math.max(0, ctx.subject.age - 20) * 0.014);
      return 0.8 * ageFactor;
    },
    tau: 1440,
    production: [
      {
        source: "constant",
        coefficient: 0.001,
        transform: (_: any, state) => 0.8 - (state.auxiliary.ghReserve ?? 0.8),
      },
    ],
    clearance: [],
  },
  initialValue: 0.8,
};
