import type { SignalDefinition, DynamicsContext } from "../../../engine";
import {
  minuteToPhase,
  hourToPhase,
  windowPhase,
  gaussianPhase,
  widthToConcentration,
  minutesToPhaseWidth,
} from "../../utils";

export const thyroid: SignalDefinition = {
  key: "thyroid",
  type: "hormone",
  label: "Thyroid",
  isPremium: true,
  unit: "pmol/L",
  description:
    "The body's 'metabolic thermostat.' Thyroid hormones set the pace for how quickly your cells burn energy and produce heat.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      // Scale circadian rhythm around subject's baseline if bloodwork available
      // freeT4 in ng/dL maps to the thyroid signal's pmol/L output via ratio-scaling
      const baselineT4 = ctx.subject.bloodwork?.hormones?.freeT4_ng_dL ?? 1.2;
      const scale = baselineT4 / 1.2;
      const sexFactor = ctx.subject.sex === "female" ? 0.97 : 1.0;
      const ageFactor = Math.max(0.9, 1.0 - Math.max(0, ctx.subject.age - 60) * 0.002);
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const active = windowPhase(
        p,
        hourToPhase(8),
        hourToPhase(23),
        minutesToPhaseWidth(80),
      );
      const midday = gaussianPhase(
        p,
        hourToPhase(12),
        widthToConcentration(360),
      );
      const nightDip = gaussianPhase(
        p,
        hourToPhase(2.0),
        widthToConcentration(300),
      );
      return (1.0 + 2.0 * active + 1.5 * midday - 1.2 * nightDip) * scale * sexFactor * ageFactor;
    },
    tau: 43200,
    production: [],
    clearance: [],
    couplings: [
      { source: "cortisol", effect: "inhibit", strength: 0.0001 },
      { source: "leptin", effect: "stimulate", strength: 0.0001 },
    ],
  },
  initialValue: (ctx) => {
    const baselineT4 = ctx.subject.bloodwork?.hormones?.freeT4_ng_dL ?? 1.2;
    return 1.0 * (baselineT4 / 1.2);
  },
  display: {
    referenceRange: { min: 10, max: 25 },
  },
  monitors: [
    {
      id: "thyroid_suppression",
      signal: "thyroid",
      pattern: { type: "falls_below", value: 10, sustainedMins: 10080 }, // 7 days
      outcome: "warning",
      message: "Metabolic suppression (Low Thyroid)",
      description:
        "Sustained low thyroid activity can slow your metabolism, lower body temperature, and cause fatigue.",
    },
    {
      id: "thyroid_hyper",
      signal: "thyroid",
      pattern: { type: "exceeds", value: 30, sustainedMins: 1440 },
      outcome: "warning",
      message: "Hyperthyroid drive",
      description:
        "Excessive thyroid signaling can cause rapid heart rate, anxiety, and weight loss.",
    },
  ],
};
