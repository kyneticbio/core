import type { SignalDefinition, DynamicsContext } from "../../../engine";
import {
  minuteToPhase,
  hourToPhase,
  windowPhase,
  gaussianPhase,
  widthToConcentration,
  minutesToPhaseWidth,
} from "../../utils";

export const vasopressin: SignalDefinition = {
  key: "vasopressin",
  type: "hormone",
  label: "Vasopressin",
  isPremium: true,
  unit: "pg/mL",
  description:
    "The 'antidiuretic' hormone. It regulates your body's water balance and blood pressure.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = 1.0 + Math.max(0, ctx.subject.age - 50) * 0.005;
      const sexFactor = ctx.subject.sex === "male" ? 1.1 : 1.0;
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const couple = gaussianPhase(
        p,
        hourToPhase(8.5),
        widthToConcentration(260),
      );
      const nightRise = windowPhase(
        p,
        hourToPhase(23),
        hourToPhase(7),
        minutesToPhaseWidth(45),
      );
      return (1.8 + 3.5 * couple + 3.5 * nightRise) * ageFactor * sexFactor;
    },
    tau: 20,
    production: [],
    clearance: [{ type: "linear", rate: 0.05 }],
    couplings: [],
  },
  initialValue: 5,
  display: {
    referenceRange: { min: 1, max: 5 },
  },
  monitors: [
    {
      id: "high_vasopressin",
      signal: "vasopressin",
      pattern: { type: "exceeds", value: 8, sustainedMins: 60 },
      outcome: "warning",
      message: "Fluid retention signal (High Vasopressin)",
      description:
        "High vasopressin promotes water retention and can increase blood pressure.",
    },
  ],
};
