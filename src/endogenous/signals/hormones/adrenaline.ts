import type { SignalDefinition, DynamicsContext } from "../../../engine";
import { minuteToPhase, hourToPhase, gaussianPhase } from "../../utils";

export const adrenaline: SignalDefinition = {
  key: "adrenaline",
  label: "Adrenaline",
  isPremium: true,
  unit: "pg/mL",
  description:
    "The 'acute stress' signal. Adrenaline rapidly increases heart rate and blood pressure while mobilizing sugar for immediate energy. It's the chemical driver of the 'fight or flight' response.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      return 30.0 + 80.0 * gaussianPhase(p, hourToPhase(10), 2.0);
    },
    tau: 5,
    production: [],
    clearance: [],
    couplings: [
      { source: "orexin", effect: "stimulate", strength: 0.4 },
      { source: "dopamine", effect: "stimulate", strength: 1.0 },
      { source: "gaba", effect: "inhibit", strength: 0.3 },
    ],
  },
  initialValue: 30,
  min: 0,
  max: 1000,
  display: {
    referenceRange: { min: 10, max: 100 },
  },
  monitors: [
    {
      id: "adrenaline_panic_threshold",
      signal: "adrenaline",
      pattern: { type: "exceeds", value: 500, sustainedMins: 5 },
      outcome: "critical",
      message: "Extreme Adrenaline (Panic/Shock)",
      description:
        "Adrenaline has reached levels associated with extreme fear, panic, or physical shock.",
    },
    {
      id: "adrenaline_fight_or_flight",
      signal: "adrenaline",
      pattern: { type: "exceeds", value: 200, sustainedMins: 10 },
      outcome: "warning",
      message: "Fight-or-Flight activated",
      description:
        "Significant acute stress response. Heart rate and focus are likely elevated.",
    },
  ],
};
