import type { SignalDefinition, DynamicsContext } from "../../../engine";
import {
  minuteToPhase,
  hourToPhase,
  gaussianPhase,
  widthToConcentration,
} from "../../utils";

export const gip: SignalDefinition = {
  key: "gip",
  label: "GIP",
  isPremium: true,
  unit: "pmol/L",
  description:
    "Glucose-dependent insulinotropic polypeptide. An incretin hormone released from the gut after eating, which enhances insulin secretion and plays a role in nutrient metabolism.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      // GIP is released after meals, particularly those high in fat and carbs
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      const bk = gaussianPhase(p, hourToPhase(8.5), widthToConcentration(80));
      const ln = gaussianPhase(p, hourToPhase(13.0), widthToConcentration(90));
      const dn = gaussianPhase(p, hourToPhase(19.0), widthToConcentration(100));
      return Math.min(40, 5.0 + 25.0 * (bk + 0.9 * ln + 0.8 * dn));
    },
    tau: 10, // GIP has a short half-life of ~5-7 minutes
    production: [],
    clearance: [{ type: "linear", rate: 0.1 }], // Corresponds to a half-life of ~7 mins
    couplings: [{ source: "insulin", effect: "stimulate", strength: 0.0005 }],
  },
  initialValue: 5,
  min: 0,
  max: 100,
  display: {
    referenceRange: { min: 5, max: 40 },
  },
  monitors: [
    {
      id: "gip_satiety",
      signal: "gip",
      pattern: { type: "exceeds", value: 30, sustainedMins: 30 },
      outcome: "win",
      message: "Strong Incretin Signal (GIP)",
      description:
        "GIP is elevated, which enhances insulin secretion and promotes satiety.",
    },
  ],
};
