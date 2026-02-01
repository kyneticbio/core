import type { SignalDefinition } from "../../../engine";
import { minuteToPhase, hourToPhase, windowPhase } from "../../utils";

export const melatonin: SignalDefinition = {
  key: "melatonin",
  label: "Melatonin",
  unit: "pg/mL",
  description:
    "Often called the 'vampire hormone,' melatonin is your brain's primary signal for biological night. It doesn't knock you out like a sedative, but rather opens the 'sleep gate' and helps coordinate your body's internal clocks.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx: any, state: any) => {
      const p = minuteToPhase(ctx.circadianMinuteOfDay);
      return 80.0 * windowPhase(p, hourToPhase(21), hourToPhase(7.5), 0.5);
    },
    tau: 30,
    production: [],
    clearance: [{ type: "linear", rate: 0.03 }],
    couplings: [{ source: "dopamine", effect: "inhibit", strength: 2.0 }],
  },
  initialValue: 5,
  min: 0,
  max: 150,
  display: {
    referenceRange: { min: 0, max: 100 },
  },
  monitors: [
    {
      id: "melatonin_dim_light_onset",
      signal: "melatonin",
      pattern: { type: "increases_by", amount: 10, mode: "absolute", windowMins: 60 },
      outcome: "win",
      message: "Dim Light Melatonin Onset (DLMO)",
      description: "Your body is preparing for sleep. This is the ideal time to reduce light exposure.",
    },
    {
      id: "melatonin_suppression",
      signal: "melatonin",
      pattern: { type: "falls_below", value: 10, sustainedMins: 30 },
      outcome: "warning",
      message: "Melatonin suppressed at night",
      description: "Bright light or stress may be suppressing your natural sleep signal.",
    },
  ],
};
