import type { SignalDefinition, DynamicsContext } from "../../../engine";
import {
  minuteToPhase,
  hourToPhase,
  windowPhase,
  gaussianPhase,
  widthToConcentration,
  minutesToPhaseWidth,
} from "../../utils";

export const vip: SignalDefinition = {
  key: "vip",
  type: "hormone",
  label: "VIP",
  isPremium: true,
  unit: "pg/mL",
  description: "A master synchronizer for your internal clocks.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const ageFactor = Math.max(0.7, 1.0 - Math.max(0, ctx.subject.age - 40) * 0.005);
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const day = gaussianPhase(p, hourToPhase(12), widthToConcentration(300));
      const eveningSuppress = windowPhase(
        p,
        hourToPhase(20),
        hourToPhase(8),
        minutesToPhaseWidth(35),
      );
      return (20.0 + 50.0 * day - 25.0 * eveningSuppress) * ageFactor;
    },
    tau: 30,
    production: [],
    clearance: [{ type: "linear", rate: 0.03 }],
    couplings: [],
  },
  initialValue: 20,
  display: {
    referenceRange: { min: 0, max: 100 },
  },
};
