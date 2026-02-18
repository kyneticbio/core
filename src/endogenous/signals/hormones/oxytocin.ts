import type { SignalDefinition, DynamicsContext } from "../../../engine";
import {
  minuteToPhase,
  hourToPhase,
  gaussianPhase,
  sigmoidPhase,
  widthToConcentration,
  minutesToPhaseWidth,
} from "../../utils";

export const oxytocin: SignalDefinition = {
  key: "oxytocin",
  type: "hormone",
  label: "Oxytocin",
  isPremium: true,
  unit: "pg/mL",
  description:
    "The 'bonding hormone,' oxytocin promotes feelings of trust, safety, and social connection.",
  idealTendency: "higher",
  dynamics: {
    setpoint: (ctx, state) => {
      const sexFactor = ctx.subject.sex === "female" ? 1.2 : 1.0;
      const ageFactor = Math.max(0.8, 1.0 - Math.max(0, ctx.subject.age - 40) * 0.003);
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const social = gaussianPhase(
        p,
        hourToPhase(11),
        widthToConcentration(260),
      );
      const evening = sigmoidPhase(
        p,
        hourToPhase(19),
        minutesToPhaseWidth(40 * 4),
      );
      return (1.5 + 4.0 * social + 5.0 * evening) * sexFactor * ageFactor;
    },
    tau: 20,
    production: [],
    clearance: [{ type: "linear", rate: 0.05 }],
    couplings: [
      { source: "endocannabinoid", effect: "stimulate", strength: 0.002 },
      { source: "serotonin", effect: "stimulate", strength: 0.03 },
    ],
  },
  initialValue: 5,
  display: {
    referenceRange: { min: 1, max: 10 },
  },
  monitors: [
    {
      id: "oxytocin_peak",
      signal: "oxytocin",
      pattern: { type: "exceeds", value: 8, sustainedMins: 30 },
      outcome: "win",
      message: "Strong Social Connection",
      description: "Oxytocin levels are high, promoting trust and safety.",
    },
  ],
};
