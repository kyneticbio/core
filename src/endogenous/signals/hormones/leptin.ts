import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const leptin: SignalDefinition = {
  key: "leptin",
  label: "Leptin",
  isPremium: true,
  unit: "ng/mL",
  description:
    "The 'long-term satiety' signal. Leptin is produced by your fat cells and tells your brain how much stored energy you have. It helps regulate your metabolic rate and long-term appetite balance.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) =>
      15.0 +
      5.0 * Math.cos(((ctx.circadianMinuteOfDay / 60 - 24) * Math.PI) / 12),
    tau: 1440,
    production: [],
    clearance: [],
    couplings: [{ source: "insulin", effect: "stimulate", strength: 0.05 }],
  },
  initialValue: 15,
  display: {
    referenceRange: { min: 2, max: 15 },
  },
  monitors: [
    {
      id: "leptin_resistance_risk",
      signal: "leptin",
      pattern: { type: "exceeds", value: 30, sustainedMins: 10080 }, // 7 days
      outcome: "warning",
      message: "Potential Leptin Resistance",
      description:
        "Chronically high leptin (often from high fat mass) can lead to resistance, making it harder to feel full and regulate metabolism.",
    },
    {
      id: "leptin_low_energy_stores",
      signal: "leptin",
      pattern: { type: "falls_below", value: 2, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low energy signal (Leptin low)",
      description:
        "Low leptin tells your brain you're in a significant energy deficit, which can suppress thyroid and reproductive hormones.",
    },
  ],
};
