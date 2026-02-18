import type { SignalDefinition, DynamicsContext } from "../../../engine";

export const igf1: SignalDefinition = {
  key: "igf1",
  type: "hormone",
  label: "IGF-1",
  isPremium: true,
  unit: "ng/mL",
  description:
    "Insulin-like Growth Factor 1 mediates most of growth hormone's effects on tissue growth and repair. Produced primarily by the liver in response to GH pulses.",
  idealTendency: "mid",
  dynamics: {
    setpoint: (ctx, state) => {
      // IGF-1 is relatively stable throughout the day with slight overnight dip
      // Age-dependent: peaks in puberty, declines with age
      const baseline = ctx.subject.bloodwork?.hormones?.igf1_ng_mL ?? 150;
      const ageFactor = Math.max(0.5, 1.0 - (ctx.subject.age - 25) * 0.005);
      const sexFactor = ctx.subject.sex === "male" ? 1.1 : 1.0;
      const bmiFactor = ctx.physiology.bmi <= 30 ? 1.0 : Math.max(0.8, 1.0 - (ctx.physiology.bmi - 30) * 0.01);
      return baseline * ageFactor * sexFactor * bmiFactor;
    },
    tau: 1440, // Very slow - liver production, long half-life (~15 hours)
    production: [{ source: "growthHormone", coefficient: 0.05 }],
    clearance: [{ type: "linear", rate: 0.002 }],
    couplings: [
      { source: "insulin", effect: "stimulate", strength: 0.002 },
      { source: "inflammation", effect: "inhibit", strength: 0.1 },
    ],
  },
  initialValue: (ctx) => ctx.subject.bloodwork?.hormones?.igf1_ng_mL ?? 150,
  min: 0,
  max: 600,
  display: {
    referenceRange: { min: 100, max: 300 },
  },
  monitors: [
    {
      id: "igf1_anabolic",
      signal: "igf1",
      pattern: { type: "exceeds", value: 250, sustainedMins: 60 },
      outcome: "win",
      message: "Elevated IGF-1 (Anabolic)",
      description:
        "IGF-1 is elevated, supporting tissue growth, muscle repair, and bone density.",
    },
    {
      id: "igf1_low",
      signal: "igf1",
      pattern: { type: "falls_below", value: 80, sustainedMins: 1440 },
      outcome: "warning",
      message: "Low IGF-1",
      description:
        "Chronically low IGF-1 may impair recovery and tissue repair. Check growth hormone levels and sleep quality.",
    },
  ],
};
