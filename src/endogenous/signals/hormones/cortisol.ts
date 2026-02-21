import type { SignalDefinition, DynamicsContext } from "../../../engine";
import {
  minuteToPhase,
  hourToPhase,
  windowPhase,
  gaussianPhase,
} from "../../utils";

export const cortisol: SignalDefinition = {
  key: "cortisol",
  type: "hormone",
  label: "Cortisol",
  unit: "µg/dL",
  description:
    "The body's primary 'readiness' hormone. Cortisol peaks in the morning to help you wake up and mobilize energy. While it's essential for handling stress, chronic high levels can lead to fatigue and metabolic issues.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = 1.0 + Math.max(0, ctx.subject.age - 40) * 0.003;
      const bmiFactor = ctx.physiology.bmi > 30 ? 1.0 + (ctx.physiology.bmi - 30) * 0.01 : 1.0;
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const CAR = gaussianPhase(p, hourToPhase(8.75), 1.5);
      const dayComponent = windowPhase(p, hourToPhase(8), hourToPhase(20), 0.5);
      // Scale circadian rhythm around subject's baseline if bloodwork available
      const baselineCortisol =
        ctx.subject.bloodwork?.hormones?.cortisol_ug_dL ?? 12;

      let acthF = 1.0;
      const acth = ctx.subject.bloodwork?.hormones?.acth_pg_mL;
      if (acth !== undefined) {
        if (acth < 10) {
          acthF = Math.max(0.6, acth / 10);
        } else if (acth > 50 && baselineCortisol < 10) {
          acthF = Math.max(0.7, baselineCortisol / 12);
        }
      }

      const scale = (baselineCortisol / 12) * acthF;
      return (2.0 + 18.0 * CAR + 4.0 * dayComponent) * scale * ageFactor * bmiFactor;
    },
    tau: 20,
    production: [
      {
        source: "constant",
        coefficient: 0.5,
        transform: (_: any, state) => state.auxiliary.crhPool ?? 0,
      },
    ],
    clearance: [],
    couplings: [
      { source: "orexin", effect: "stimulate", strength: 0.01 },
      { source: "melatonin", effect: "inhibit", strength: 0.007 },
      { source: "gaba", effect: "inhibit", strength: 0.0045 },
    ],
  },
  initialValue: (ctx) => {
    const baseline = ctx.subject.bloodwork?.hormones?.cortisol_ug_dL ?? 12;
    return ctx.isAsleep ? baseline * (5 / 12) : baseline;
  },
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
      description:
        "Sustained high cortisol may indicate chronic stress and can affect sleep, mood, and metabolism.",
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
      description:
        "Healthy cortisol should vary throughout the day. A flat pattern may indicate HPA axis dysfunction.",
    },
  ],
};
