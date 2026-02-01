import type { SignalDefinition } from "../../../engine";
import {
  minuteToPhase,
  hourToPhase,
  windowPhase,
  gaussianPhase,
} from "../../utils";

export const cortisol: SignalDefinition = {
  key: "cortisol",
  label: "Cortisol",
  unit: "µg/dL",
  description:
    "The body's primary 'readiness' hormone. Cortisol peaks in the morning to help you wake up and mobilize energy. While it's essential for handling stress, chronic high levels can lead to fatigue and metabolic issues.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx: any, state: any) => {
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const CAR = gaussianPhase(p, hourToPhase(8.75), 1.5);
      const dayComponent = windowPhase(p, hourToPhase(8), hourToPhase(20), 0.5);
      return 2.0 + 18.0 * CAR + 4.0 * dayComponent;
    },
    tau: 20,
    production: [
      {
        source: "constant",
        coefficient: 0.5,
        transform: (_: any, state: any) => state.auxiliary.crhPool ?? 0,
      },
    ],
    clearance: [],
    couplings: [
      { source: "orexin", effect: "stimulate", strength: 0.01 },
      { source: "melatonin", effect: "inhibit", strength: 0.007 },
      { source: "gaba", effect: "inhibit", strength: 0.0045 },
    ],
  },
  initialValue: (ctx: any) => (ctx.isAsleep ? 5 : 12),
  min: 0,
  max: 50,
  display: {
    referenceRange: { min: 5, max: 25 },
  },
  monitors: [
    {
      id: "cortisol_chronic_elevation",
      signal: "cortisol",
      pattern: { type: "high_exposure", windowMins: 1440, threshold: 20000 },
      outcome: "warning",
      message: "Chronically elevated cortisol detected",
      description: "Sustained high cortisol may indicate chronic stress and can affect sleep, mood, and metabolism.",
    },
    {
      id: "cortisol_acute_spike",
      signal: "cortisol",
      pattern: { type: "exceeds", value: 35, sustainedMins: 30 },
      outcome: "warning",
      message: "Cortisol spike detected",
      description: "A significant stress response is occurring.",
    },
    {
      id: "cortisol_flat_pattern",
      signal: "cortisol",
      pattern: { type: "low_variability", windowMins: 1440, cvThreshold: 0.15 },
      outcome: "warning",
      message: "Flat cortisol rhythm detected",
      description: "Healthy cortisol should vary throughout the day. A flat pattern may indicate HPA axis dysfunction.",
    },
  ],
};
