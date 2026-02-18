import type { SignalDefinition, DynamicsContext } from "../../../engine";
import {
  minuteToPhase,
  hourToPhase,
  gaussianPhase,
  sigmoidPhase,
} from "../../utils";

export const energy: SignalDefinition = {
  key: "energy",
  type: "derived",
  label: "Vitality",
  unit: "%",
  description:
    "How energetic you feel right now. This subjective sense of 'gas in the tank' is driven by blood sugar, stimulating neurotransmitters, thyroid activity, and inflammation levels.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = Math.max(0.7, 1.0 - Math.max(0, ctx.subject.age - 30) * 0.003);
      const p = minuteToPhase(ctx.minuteOfDay);
      const wakeDrive = sigmoidPhase(p, hourToPhase(2), 1.0);
      const afternoonDip = gaussianPhase(p, hourToPhase(9), 1.5);
      const tone = 50.0 + 40.0 * wakeDrive - 15.0 * afternoonDip;
      return tone * (0.8 + 0.2 * (ctx.physiology?.metabolicCapacity ?? 1.0)) * ageFactor;
    },
    tau: 120,
    production: [
      {
        source: "glucose",
        coefficient: 0.1,
        transform: (G: any) => Math.min(1.0, G / 100),
      },
      { source: "dopamine", coefficient: 0.05 },
      { source: "thyroid", coefficient: 0.5 },
      { source: "estrogen", coefficient: 0.02 },
      { source: "cortisol", coefficient: 0.1 },
    ],
    clearance: [
      {
        type: "linear",
        rate: 0.01,
        transform: (_: any, state, ctx) => (ctx.isAsleep ? 0.5 : 1.0),
      },
    ],
    couplings: [
      { source: "inflammation", effect: "inhibit", strength: 0.3 },
      { source: "melatonin", effect: "inhibit", strength: 0.05 },
    ],
  },
  initialValue: 50,
  min: 0,
  max: 150,
  display: {
    referenceRange: { min: 40, max: 80 },
  },
  monitors: [
    {
      id: "vitality_peak",
      signal: "energy",
      pattern: { type: "exceeds", value: 90, sustainedMins: 30 },
      outcome: "win",
      message: "Peak Vitality",
      description:
        "You're in a high-energy, high-alert state. Ideal for focus or intense activity.",
    },
    {
      id: "vitality_crash",
      signal: "energy",
      pattern: { type: "falls_below", value: 25, sustainedMins: 60 },
      outcome: "warning",
      message: "Low Vitality (Crash)",
      description:
        "You're feeling significantly drained. Check glucose, stress, or sleep debt.",
    },
  ],
};
