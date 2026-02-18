import type { SignalDefinition, DynamicsContext } from "../../../engine";
import { minuteToPhase, hourToPhase, gaussianPhase } from "../../utils";

export const glucagon: SignalDefinition = {
  key: "glucagon",
  type: "metabolic",
  label: "Glucagon",
  isPremium: true,
  unit: "pg/mL",
  description: "The 'mobilization' hormone. Released when blood sugar is low.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const bmiFactor = ctx.physiology.bmi <= 25 ? 1.0 : 1.0 + (ctx.physiology.bmi - 25) * 0.015;
      const ageFactor = 1.0 + Math.max(0, ctx.subject.age - 40) * 0.002;
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const nocturnal =
        gaussianPhase(p, hourToPhase(23), 1.0) +
        0.8 * gaussianPhase(p, hourToPhase(1.5), 0.8);
      const daytimeSuppression = gaussianPhase(p, hourToPhase(7.5), 0.5);
      return (40 + 35 * nocturnal - 15 * daytimeSuppression) * bmiFactor * ageFactor;
    },
    tau: 60,
    production: [{ source: "cortisol", coefficient: 0.033 }],
    clearance: [{ type: "linear", rate: 0.02 }],
    couplings: [{ source: "insulin", effect: "inhibit", strength: 0.0083 }],
  },
  initialValue: 50,
  min: 20,
  max: 150,
  display: {
    referenceRange: { min: 50, max: 150 },
  },
  monitors: [
    {
      id: "glucagon_high",
      signal: "glucagon",
      pattern: { type: "exceeds", value: 180, sustainedMins: 60 },
      outcome: "warning",
      message: "High Glucagon drive",
      description:
        "Excessive glucagon can drive up blood sugar even while fasting.",
    },
  ],
};
