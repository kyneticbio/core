import type { SignalDefinition } from "../../../engine";
import {
  minuteToPhase,
  hourToPhase,
  gaussianPhase,
  sigmoidPhase,
} from "../../utils";

export const norepi: SignalDefinition = {
  key: "norepi",
  label: "Norepinephrine",
  isPremium: true,
  unit: "pg/mL",
  description:
    "Both a hormone and a neurotransmitter, this is your brain's 'focus' signal. It increases alertness and arousal, sharpening your attention and preparing your body for action-essential for concentration and productivity.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx: any, state: any) => {
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const wakeDrive = sigmoidPhase(p, hourToPhase(8.5), 1.0);
      const stressResponse = gaussianPhase(p, hourToPhase(9), 0.5);
      return 156.0 + 250.0 * wakeDrive + 94.0 * stressResponse;
    },
    tau: 5,
    production: [
      {
        source: "constant",
        coefficient: 0.002,
        transform: (_: any, state: any) => {
          const vesicles = state.auxiliary.norepinephrineVesicles ?? 0.8;
          return vesicles * 281;
        },
      },
    ],
    clearance: [
      { type: "enzyme-dependent", rate: 0.002, enzyme: "NET" },
      { type: "enzyme-dependent", rate: 0.001, enzyme: "MAO_A" },
    ],
    couplings: [
      { source: "cortisol", effect: "stimulate", strength: 0.104 },
      { source: "orexin", effect: "stimulate", strength: 0.05 },
      { source: "gaba", effect: "inhibit", strength: 0.5 },
    ],
  },
  initialValue: 250,
  min: 0,
  max: 2000,
  display: {
    referenceRange: { min: 100, max: 450 },
  },
  monitors: [
    {
      id: "norepi_alertness",
      signal: "norepi",
      pattern: { type: "exceeds", value: 600, sustainedMins: 15 },
      outcome: "win",
      message: "Hyper-Alertness (Norepinephrine)",
      description:
        "High norepinephrine levels are sharpening your focus and preparing you for action.",
    },
    {
      id: "norepi_anxiety_risk",
      signal: "norepi",
      pattern: { type: "exceeds", value: 1000, sustainedMins: 15 },
      outcome: "warning",
      message: "Anxiety Risk (Extreme Norepi)",
      description:
        "Excessive norepinephrine can cause jitteriness, racing heart, and anxiety.",
    },
  ],
};
